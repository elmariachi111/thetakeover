import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Divider,
  Flex,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import { Provider } from "next-auth/providers";
import { getCsrfToken, getProviders, signIn } from "next-auth/react";

export function CredentialSignin({
  provider,
  csrfToken,
  callbackUrl,
}: {
  provider: Provider;
  csrfToken: string;
  callbackUrl: string;
}) {
  return (
    <form method="post" action="/api/auth/callback/credentials">
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
      <input name="callbackUrl" type="hidden" defaultValue={callbackUrl} />
      <FormLabel>
        Email
        <Input name="email" type="email" />
      </FormLabel>
      <FormLabel>
        Password
        <Input name="password" type="password" />
      </FormLabel>
      <Button type="submit">Sign in</Button>
    </form>
  );
}

// signIn("email", { email: "jsmith@example.com" })
export function EmailSignin({
  csrfToken,
  callbackUrl,
}: {
  csrfToken: string;
  callbackUrl: string;
}) {
  return (
    <form method="post" action="/api/auth/signin/email">
      <input name="callbackUrl" type="hidden" defaultValue={callbackUrl} />

      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

      <FormLabel>
        Email address
        <Input name="email" id="email" type="email" />
      </FormLabel>
      <Button type="submit">Sign in</Button>
    </form>
  );
}

export default function SignIn({
  providers,
  csrfToken,
  callbackUrl,
}: {
  providers: Provider[];
  csrfToken: string;
  callbackUrl: string;
}) {
  const credentialProvider = Object.values(providers).find(
    (p) => p.type === "credentials"
  );

  const emailProvider = Object.values(providers).find(
    (p) => p.type === "email"
  );

  return (
    <Flex direction="column" gridGap={3} my={5}>
      <Heading textTransform="uppercase">Signin</Heading>
      {Object.values(providers)
        .filter((p) => p.type === "oauth")
        .map((provider: Provider) => (
          <Flex key={provider.name}>
            <Button onClick={() => signIn(provider.id, { callbackUrl })}>
              Sign in with {provider.name}
            </Button>
          </Flex>
        ))}

      <Flex direction="row" align="center" gridGap={5}>
        <Divider orientation="horizontal" />
        <Text>OR</Text>
        <Divider orientation="horizontal" />
      </Flex>
      {emailProvider && (
        <EmailSignin csrfToken={csrfToken} callbackUrl={callbackUrl} />
      )}
      {credentialProvider && (
        <Flex direction="column">
          <Alert size="sm" status="warning" variant="top-accent" my={2}>
            <AlertIcon />
            <AlertDescription>
              Don't use these for creation, only for payment testing:
            </AlertDescription>
          </Alert>
          <CredentialSignin
            provider={credentialProvider}
            csrfToken={csrfToken}
            callbackUrl={callbackUrl}
          />
        </Flex>
      )}
    </Flex>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: {
      providers,
      csrfToken: await getCsrfToken(context),
      callbackUrl: context.query.callbackUrl,
    },
  };
}
