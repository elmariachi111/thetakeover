import {
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
}: {
  provider: Provider;
  csrfToken: string;
}) {
  return (
    <form method="post" action="/api/auth/callback/credentials">
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

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

export default function SignIn({
  providers,
  csrfToken,
}: {
  providers: Provider[];
  csrfToken: string;
}) {
  const credentialProvider = Object.values(providers).find(
    (p) => p.type === "credentials"
  );

  return (
    <Flex direction="column" gridGap={3} my={5}>
      <Heading textTransform="uppercase">Signin</Heading>

      {Object.values(providers)
        .filter((p) => p.type === "oauth")
        .map((provider: Provider) => (
          <Flex key={provider.name}>
            <Button onClick={() => signIn(provider.id)}>
              Sign in with {provider.name}
            </Button>
          </Flex>
        ))}

      <Flex direction="row" align="center" gridGap={5}>
        <Divider orientation="horizontal" />
        <Text>OR</Text>
        <Divider orientation="horizontal" />
      </Flex>
      {credentialProvider && (
        <CredentialSignin provider={credentialProvider} csrfToken={csrfToken} />
      )}
    </Flex>
  );
}

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: {
      providers,
      csrfToken: await getCsrfToken(context),
    },
  };
}
