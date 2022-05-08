import { Button, Icon } from "@chakra-ui/react";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useCallback } from "react";
import { SiweMessage } from "siwe";
import { useWeb3 } from "../../modules/Web3Context";
import { FaEthereum } from 'react-icons/fa';

export const SiweButton = (props: {
  children?: React.ReactNode,
  onConnected?: (addr: string) => void,
}) => {
  const { data: session } = useSession();
  const { connect } = useWeb3();

  const handleSiwe = useCallback(async () => {
    try {
      const csrfToken = await getCsrfToken();
      const {
        signer,
        account,
        chainId,
      } = await connect();

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
        if (props.onConnected) {
          props.onConnected(account as string);
        }

      }

    } catch (error) {
      window.alert(error);
    }
  }, [session, connect]);

  return (<>
    <Button onClick={handleSiwe} leftIcon={<FaEthereum />}>{props.children}</Button >
  </>
  );
};
