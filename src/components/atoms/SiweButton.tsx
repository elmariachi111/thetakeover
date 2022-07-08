import { Button, Icon, useToast } from "@chakra-ui/react";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useCallback } from "react";
import { SiweMessage } from "siwe";
import { useWeb3 } from "../../context/Web3Context";
import { FaEthereum } from "react-icons/fa";

export const SiweButton = (props: {
  children?: React.ReactNode;
  onConnected?: (addr: string) => void;
}) => {
  const { data: session } = useSession();
  const { connect } = useWeb3();
  const toast = useToast();
  const { onConnected } = props;

  const handleSiwe = useCallback(async () => {
    try {
      const csrfToken = await getCsrfToken();
      const { signer, account, chainId } = await connect();

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
        const result: {
          ok: boolean;
          status: number;
          error: string;
        } = (await signIn("ethereum", {
          message: JSON.stringify(message),
          redirect: false,
          signature,
          callbackUrl,
        })) as any | undefined;
        if (result.error) {
          throw { message: result.error };
        } else {
          if (onConnected) {
            onConnected(account as string);
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      toast({
        status: "error",
        title: "ethereum connection failed",
        description: error.message,
      });
    }
  }, [connect, onConnected, toast]);

  return (
    <>
      <Button onClick={handleSiwe} leftIcon={<FaEthereum />}>
        {props.children}
      </Button>
    </>
  );
};
