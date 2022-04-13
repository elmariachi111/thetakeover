import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import { signIn, useSession, getCsrfToken } from "next-auth/react";
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { useCallback } from "react";

export default function LoginComponent() {
  const { data: session } = useSession();
  const [{ data: connectData, loading }, connect] = useConnect();
  const [{ data: networkData }] = useNetwork();
  const [{ data: accountData }] = useAccount();
  const [, signMessage] = useSignMessage();

  const handleSiwe = useCallback(async () => {
    try {
      const csrfToken = await getCsrfToken();
      console.log(`got csrf token ${csrfToken}`, connectData.connectors);
      console.log("connector", loading, connectData.connectors[0]);
      //const result = await connect(connectData.connectors[0]);
      //console.debug(result);

      // if (result.error) {
      //   console.error(result.error);
      //   return;
      // }

      const callbackUrl = "/";
      const message = new SiweMessage({
        domain: window.location.host,
        address: accountData?.address,
        statement: "Sign into The Takeover with an Ethereum wallet.",
        uri: window.location.origin,
        version: "1",
        chainId: networkData.chain?.id,
        nonce: csrfToken,
      });

      const { data: signature, error } = await signMessage({
        message: message.prepareMessage(),
      });

      if (signature) {
        await signIn("ethereum", {
          message: JSON.stringify(message),
          redirect: false,
          signature,
          callbackUrl,
        });
      }
    } catch (error) {
      window.alert(error);
    }
  }, [
    session,
    signMessage,
    loading,
    networkData,
    accountData,
    connect,
    connectData,
  ]);

  if (session) {
    return (
      <Flex direction="column" align="center" p={2}>
        <Text fontSize="xs">You're logged in as</Text>
        <Text fontSize="sm" fontWeight="bold" isTruncated>
          {session.user?.email}
        </Text>
        <Button onClick={handleSiwe}>Sign in with Ethereum</Button>
      </Flex>
    );
  }
  return (
    <Flex>
      <Button onClick={() => signIn()}>Sign in</Button>
      <Button onClick={handleSiwe}>Sign in with Ethereum</Button>
    </Flex>
  );
}
