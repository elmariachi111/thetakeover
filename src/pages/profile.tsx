import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  Link,
  Spacer,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Account, SellerAccount, User } from "@prisma/client";
import axios from "axios";
import { Form, Formik, useField } from "formik";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getCsrfToken, getSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { SiweButton } from "../components/atoms/SiweButton";
import { SellerAccountView } from "../components/molecules/SellerDetails";
import { adapterClient } from "../modules/api/adapter";
import { default as NextLink } from "next/link";
import { Identicon } from "../components/atoms/Identicon";
import { SellerAccountDialog } from "../components/molecules/SellerAccountDialog";

type XUser = Omit<User, "emailVerified"> & {
  emailVerified: string | null;
  accounts: Account[];
  sellerAccount: SellerAccount | null;
};

export const getServerSideProps: GetServerSideProps<{
  user: XUser;
  sellerAccount: SellerAccount | null;
}> = async (context) => {
  const session = await getSession(context);

  if (!session?.user?.id) {
    return {
      redirect: {
        permanent: false,
        destination: `/`,
      },
    };
  }

  const userData = await adapterClient.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
      sellerAccount: true,
    },
  });
  if (!userData) {
    return {
      redirect: {
        permanent: false,
        destination: `/`,
      },
    };
  }

  const sellerAccount = await adapterClient.sellerAccount.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  return {
    props: {
      user: {
        ...userData,
        emailVerified: userData.emailVerified?.toISOString() || null,
      },
      sellerAccount,
    },
  };
};

const EmailVerified = (props: { user: XUser; value: string }) => {
  const verified =
    !!props.user.emailVerified && props.value === props.user.email;
  const [verificationSent, setVerificationSent] = useState<boolean>(verified);
  const toast = useToast();

  const verifyEmail = async () => {
    const csrfToken = await getCsrfToken();
    const signinPayload = {
      csrfToken,
      email: props.value,
      callbackUrl: `${window.location.origin}/profile`,
    };

    await axios.post("/api/auth/signin/email", signinPayload);
    setVerificationSent(true);
    toast({
      title: `we just sent a verification mail to ${props.value}`,
      description: "please check your inbox",
    });
  };

  return verified ? (
    <Icon w={6} h={6} as={FiCheckCircle} color="green.300" />
  ) : (
    <Button
      disabled={verificationSent}
      display="flex"
      aria-label="verify your email address"
      onClick={verifyEmail}
    >
      Verify
    </Button>
  );
};

const ProfileEditor = (props: { user: XUser }) => {
  const { user } = props;

  const [ethAddress, setEthAddress] = useState<string>("");
  useEffect(() => {
    const ethAccount = user.accounts.find((a) => a.provider === "ethereum");
    if (ethAccount) {
      setEthAddress(ethAccount.providerAccountId);
    }
  }, [user.accounts]);

  const [fEmail, mEmail] = useField({
    name: "email",
    value: user.email || "",
  });

  const [fName] = useField({
    name: "name",
    value: user.name || "",
  });

  return (
    <>
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input {...fName} />
      </FormControl>

      <FormControl isDisabled={!!user.emailVerified}>
        <FormLabel>Email</FormLabel>
        <Flex direction="row" align="center" gap={6}>
          <Input {...fEmail} />
          <EmailVerified user={user} value={mEmail.value} />
        </Flex>
      </FormControl>

      <FormControl isDisabled={true}>
        <FormLabel>Eth Address</FormLabel>
        <Flex direction="row" align="center" gap={6}>
          <Input type="text" value={ethAddress} />
          {ethAddress ? (
            <Identicon account={ethAddress} />
          ) : (
            <SiweButton onConnected={setEthAddress}>Connect</SiweButton>
          )}
        </Flex>
      </FormControl>
    </>
  );
};

const Profile = ({
  user,
  sellerAccount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [busy, setBusy] = useState<boolean>(false);
  const submit = async (user: XUser) => {
    setBusy(true);
    await axios.post("/api/user/update", user);
    setBusy(false);
  };

  return (
    <Flex direction="column">
      <Flex align="flex-end" my={6}>
        <Heading title={user.id}>Your Profile</Heading>
        <Spacer />
        <NextLink href="/my" passHref>
          <Link>your Takeovers</Link>
        </NextLink>
      </Flex>
      <Formik
        initialValues={user}
        onSubmit={(values) => {
          submit(values);
          return;
        }}
      >
        {() => (
          <Form id="profile-form">
            <Flex direction="column" w="100%" gridGap={5} align="center">
              <ProfileEditor user={user} />
              <Spacer />
              <Button type="submit" disabled={busy} w={3 / 4}>
                {busy && <Spinner mx={3} />}
                Save changes
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>

      <Flex mt={12} direction="column">
        <Flex align="center" justify="space-between">
          <Heading my={6}>Sales Settings</Heading>
          {sellerAccount && (
            <NextLink href="/sales" passHref>
              <Link>Sales Overview</Link>
            </NextLink>
          )}
        </Flex>
        {sellerAccount ? (
          <>
            <Flex mb={6}>
              <SellerAccountDialog sellerAccount={sellerAccount} />
            </Flex>
            <SellerAccountView sellerAccount={sellerAccount} />
          </>
        ) : (
          <Flex direction="column" align="center" gap={3} my={20}>
            <Button as={Link} href="/api/paypal/onboard" w={3 / 4}>
              connect your Paypal account
            </Button>{" "}
            <Text>to start selling items on Takeover </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

Profile.auth = true;

export default Profile;
