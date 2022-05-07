import { Button, Flex, FormControl, FormLabel, Icon, Input, Spacer } from "@chakra-ui/react";
import { Account, SellerAccount, User } from "@prisma/client";
import axios from "axios";
import { Form, Formik, useField } from "formik";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getCsrfToken, getSession } from "next-auth/react";
import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import { SiweButton } from "../components/atoms/SiweButton";
import { adapterClient } from "../modules/api/adapter";

type XUser = User & {
  emailVerified: string,
  accounts: Account[],
  sellerAccount: SellerAccount
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

  const verifyEmail = async () => {
    const csrfToken = await getCsrfToken();
    const signinPayload = {
      csrfToken,
      email: props.value,
      callbackUrl: `${window.location.origin}/profile`
    };
    console.log(signinPayload);
    const res = await axios.post("/api/auth/signin/email", signinPayload);
    console.log(res);

  };

  return verified
    ? <Icon m={6} w={6} h={6} as={FiCheckCircle} color="green.300" />
    : <Button d="flex" aria-label="verify your email address" onClick={verifyEmail}>Verify</Button>;
};

const ProfileEditor = (props: { user: XUser }) => {
  const { user } = props;
  const ethAccount = user.accounts.find(a => a.provider === "ethereum");

  const [fEmail, mEmail] = useField({
    name: "email",
    value: user.email || '',
  });

  const [fName, mName] = useField({
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
        <Input type="text" value={ethAccount?.providerAccountId || ''} />
        {!ethAccount &&
          <SiweButton>Connect</SiweButton>
        }
      </Flex>
    </FormControl>
  </>);

};

const Profile = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const submit = async (user: XUser) => {
    const res = await axios.post("/api/user/update", user);
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
        {({ errors, touched, values }) => (
          <Form id="profile-form">
            <Flex direction="column" w="100%" gridGap={5}>


              <ProfileEditor user={user} />

              <Spacer />
              <Button type="submit" >Submit</Button>

            </Flex>
          </Form>
        )}
      </Formik >
    </Flex>
  );
};

Profile.auth = true;

export default Profile;
