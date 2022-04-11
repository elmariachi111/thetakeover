import { chain, defaultChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { WalletLinkConnector } from "wagmi/connectors/walletLink";

const chains = defaultChains;

const connectors = (config: { chainId: number }) => {
  const { chainId } = config;
  const rpcUrl =
    chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
    chain.mainnet.rpcUrls[0];
  return [
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true },
    }),
    // new WalletConnectConnector({
    //   options: {
    //     infuraId,
    //     qrcode: true,
    //   },
    // }),
    // new WalletLinkConnector({
    //   options: {
    //     appName: "My wagmi app",
    //     jsonRpcUrl: `${rpcUrl}/${infuraId}`,
    //   },
    // }),
  ];
};

export { connectors };
