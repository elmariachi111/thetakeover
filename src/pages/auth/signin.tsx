import {
  Button,
  Divider,
  Flex,
  FormLabel,
  Heading,
  HStack,
  Input,
  Text,
} from "@chakra-ui/react";
import { Account } from "@prisma/client";
import axios from "axios";
import { Provider } from "next-auth/providers";
import {
  getCsrfToken,
  getProviders,
  getSession,
  signIn,
  useSession,
} from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { IoLogoGithub, IoLogoGoogle } from "react-icons/io5";
import { GeneralAlert } from "../../components/atoms/GeneralAlert";
import { SiweButton } from "../../components/atoms/SiweButton";

import { adapterClient } from "../../modules/api/adapter";

const transErrors: Record<string, string> = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked:
    "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin:
    "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  default: "Unable to sign in.",
};

const iconMap = {
  github: <IoLogoGithub />,
  google: <IoLogoGoogle />,
};
export function EmailSignin({
  csrfToken,
  callbackUrl,
}: {
  csrfToken: string;
  callbackUrl: string;
}) {
  const [submittedEMail, setSubmittedEMail] = useState<string>();
  const onSubmit = async (e: any) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const values = Object.fromEntries(data.entries());
    await axios.post("/api/auth/signin/email", values);
    setSubmittedEMail(values.email.toString());

    return false;
  };

  return (
    <form onSubmit={onSubmit}>
      {!submittedEMail ? (
        <>
          <input name="callbackUrl" type="hidden" defaultValue={callbackUrl} />
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <FormLabel>Email address</FormLabel>
          <Flex direction="row" gridGap={0} alignItems="center">
            <Input
              name="email"
              id="email"
              type="email"
              disabled={!!submittedEMail}
            />
            <Button type="submit" disabled={!!submittedEMail}>
              Sign in
            </Button>
          </Flex>
        </>
      ) : (
        <GeneralAlert
          status="success"
          title="check your inbox"
          mt={6}
          onClosed={() => setSubmittedEMail(undefined)}
        >
          <Text>
            We&apos;ve sent an email to <b>{submittedEMail}</b> with a link to
            sign you up.
          </Text>
        </GeneralAlert>
      )}
    </form>
  );
}

export default function SignIn({
  providers,
  accounts,
  csrfToken,
  callbackUrl,
}: {
  providers: Provider[];
  accounts: Account[];
  csrfToken: string;
  callbackUrl: string;
}) {
  const router = useRouter();
  const { error: signinError } = router.query;

  const { status: authStatus } = useSession();
  const emailProvider = Object.values(providers).find(
    (p) => p.type === "email"
  );

  const connectedProviderKeys = accounts.map((a) => a.provider);
  const connectableProviders = Object.keys(providers)
    .filter((p) => !connectedProviderKeys.includes(p))
    .map((k) => providers[k])
    .filter((p) => ["oauth"].includes(p.type));

  return (
    <Flex direction="column" gridGap={3} my={5}>
      {signinError && (
        <GeneralAlert title="Login failed" status="error" my={6}>
          {transErrors[signinError as string]}
        </GeneralAlert>
      )}
      <Heading size="lg">
        {authStatus === "authenticated" ? "Connect with" : "Sign in with"}
      </Heading>
      <Flex direction="row" gridGap={3}>
        {connectableProviders.map((provider: Provider) => (
          <Button
            leftIcon={iconMap[provider.id]}
            key={provider.name}
            onClick={() => signIn(provider.id, { callbackUrl })}
          >
            {provider.name}
          </Button>
        ))}
        {!accounts.find((a) => a.provider === "ethereum") && (
          <SiweButton
            onConnected={() => {
              router.replace(callbackUrl);
            }}
          >
            Ethereum
          </SiweButton>
        )}
      </Flex>
      {accounts.length > 0 && (
        <Flex mt={12} direction="column" gridGap={2}>
          <Heading size="md">Connected accounts</Heading>
          <HStack>
            {accounts.map((a) => (
              <Flex key={a.provider} direction="row" gridGap={2} align="center">
                {iconMap[a.provider]}
                <Text>{a.provider}</Text>
              </Flex>
            ))}
          </HStack>
        </Flex>
      )}
      {authStatus !== "authenticated" && emailProvider && (
        <>
          <Flex direction="row" align="center" gridGap={5} my={6}>
            <Divider orientation="horizontal" />
            <Text>OR</Text>
            <Divider orientation="horizontal" />
          </Flex>

          <EmailSignin csrfToken={csrfToken} callbackUrl={callbackUrl} />
        </>
      )}
    </Flex>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  const session = await getSession(context);

  let accounts: Account[] = [];
  if (session?.user) {
    accounts = await adapterClient.account.findMany({
      where: {
        userId: session.user.id,
      },
    });
  }

  return {
    props: {
      providers,
      accounts,
      csrfToken: await getCsrfToken(context),
      callbackUrl: context.query.callbackUrl,
    },
  };
}
