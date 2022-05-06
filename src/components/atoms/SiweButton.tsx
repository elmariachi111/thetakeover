import { Button } from "@chakra-ui/react";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useCallback } from "react";
import { SiweMessage } from "siwe";
import { useWeb3 } from "../../modules/Web3Context";

export const SiweButton = () => {
  const { data: session } = useSession();
  const { connect, account, chainId, provider, signer } = useWeb3();

  const handleSiwe = useCallback(async () => {
    try {
      const csrfToken = await getCsrfToken();

      const callbackUrl = "/";
      const message = new SiweMessage({
        domain: window.location.host,
        address: account,
        statement: "Sign into The Takeover with an Ethereum wallet.",
        uri: window.location.origin,
        version: "1",
        chainId: chainId,
        nonce: csrfToken,
      });
      const signature = await signer?.signMessage(message.prepareMessage());

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
  }, [session, signer, chainId, account]);

  return (
    <Button onClick={account ? handleSiwe : () => connect()}>Ethereum</Button>
  );
};
