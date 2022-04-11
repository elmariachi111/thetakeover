import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import { signIn, useSession, getCsrfToken } from "next-auth/react";
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

export default function LoginComponent() {
  const { data: session } = useSession();
  const [{ data: connectData, error }, connect] = useConnect();
  const [{ data: networkData }] = useNetwork();
  const [{ data: accountData }] = useAccount();
  const [, signMessage] = useSignMessage();

  const handleSiwe = async () => {
    try {
      await connect(connectData.connectors[0]);
      const callbackUrl = "/";
      const message = new SiweMessage({
        domain: window.location.host,
        address: accountData?.address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: networkData?.chain?.id,
        nonce: await getCsrfToken(),
      });
      const { data: signature, error } = await signMessage({
        message: message.prepareMessage(),
      });
      signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl,
      });
    } catch (error) {
      window.alert(error);
    }
  };

  if (session) {
    return (
      <Flex direction="column" align="center" p={2}>
        <Text fontSize="xs">You're logged in as</Text>
        <Text fontSize="sm" fontWeight="bold" isTruncated>
          {session.user?.email}
        </Text>
      </Flex>
    );
  }
  return (
    <Flex>
      <Button onClick={() => signIn()}>Sign in</Button>
      <Button onClick={() => handleSiwe()}>Sign in with Ethereum</Button>
    </Flex>
  );
}
