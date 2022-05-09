import { Button, Flex, FormControl, FormLabel, Icon, Input, Spacer, Spinner, useToast } from "@chakra-ui/react";
import { Account, SellerAccount, User } from "@prisma/client";
import axios from "axios";
import { Form, Formik, useField } from "formik";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getCsrfToken, getSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { SiweButton } from "../components/atoms/SiweButton";
import { adapterClient } from "../modules/api/adapter";

type XUser = Omit<User, "emailVerified"> & {
  emailVerified: string | null,
  accounts: Account[],
  sellerAccount: SellerAccount | null
}

export const getServerSideProps: GetServerSideProps<{
  user: XUser
}> = async (context) => {
  const session = await getSession(context);

  if (!session?.user?.id) {
    return {
      redirect: {
        permanent: false,
        destination: `/`
      }
    };
  }

  const userData = await adapterClient.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
      sellerAccount: true
    }
  });
  if (!userData) {
    return {
      redirect: {
        permanent: false,
        destination: `/`
      }
    };
  }

  return {
    props: {
      user: {
        ...userData,
        emailVerified: userData.emailVerified?.toISOString() || null
      }
    }
  };
};

const EmailVerified = (props: {
  user: XUser,
  value: string,
}) => {
  const verified = !!props.user.emailVerified && props.value === props.user.email;
  const [verificationSent, setVerificationSent] = useState<boolean>(verified);
  const toast = useToast();

  const verifyEmail = async () => {
    const csrfToken = await getCsrfToken();
    const signinPayload = {
      csrfToken,
      email: props.value,
      callbackUrl: `${window.location.origin}/profile`
    };

    await axios.post("/api/auth/signin/email", signinPayload);
    setVerificationSent(true);
    toast({
      title: `we just sent a verification mail to ${props.value}`,
      description: "please check your inbox"
    });
  };

  return verified
    ? <Icon m={6} w={6} h={6} as={FiCheckCircle} color="green.300" />
    : <Button disabled={verificationSent} d="flex" aria-label="verify your email address" onClick={verifyEmail}>Verify</Button>;
};

const ProfileEditor = (props: { user: XUser }) => {
  const { user } = props;

  const [ethAddress, setEthAddress] = useState<string>("");
  useEffect(() => {
    const ethAccount = user.accounts.find(a => a.provider === "ethereum");
    if (ethAccount) {
      setEthAddress(ethAccount.providerAccountId);
    }
  }, []);


  const [fEmail, mEmail] = useField({
    name: "email",
    value: user.email || '',
  });

  const [fName] = useField({
    name: "name",
    value: user.name || '',
  });


  return (<>
    <FormControl>
      <FormLabel>Name</FormLabel>
      <Input {...fName} />
    </FormControl>

    <FormControl isDisabled={!!user.emailVerified}>
      <FormLabel>Email</FormLabel>
      <Flex direction="row" align="center">
        <Input {...fEmail} />
        <EmailVerified user={user} value={mEmail.value} />
      </Flex>
    </FormControl>

    <FormControl isDisabled={true}>
      <FormLabel>Eth Address</FormLabel>
      <Flex direction="row">
        <Input type="text" value={ethAddress} />
        {!ethAddress &&
          <SiweButton onConnected={setEthAddress}>Connect</SiweButton>
        }
      </Flex>
    </FormControl>
  </>);

};

const Profile = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const [busy, setBusy] = useState<boolean>(false);
  const submit = async (user: XUser) => {
    setBusy(true);
    await axios.post("/api/user/update", user);
    setBusy(false);
  };

  return (
    <Flex direction="column">
      <Formik
        initialValues={user}
        onSubmit={(values) => {
          submit(values);
          return;
        }}
      >
        {() => (
          <Form id="profile-form">
            <Flex direction="column" w="100%" gridGap={5}>
              <ProfileEditor user={user} />
              <Spacer />
              <Button type="submit" disabled={busy}>
                {busy && <Spinner mx={3} />}
                Submit
              </Button>
            </Flex>
          </Form>
        )}
      </Formik >
    </Flex>
  );
};

Profile.auth = true;

export default Profile;
