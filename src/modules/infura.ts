import { providers } from "ethers";

const chainToInfura = (chain: string) => {
  if (chain === "ethereum") {
    return "mainnet";
  }

  if (chain === "polygon" || chain === "matic") {
    return "polygon-mainnet";
  }

  if (chain === "arbitrum") {
    return "arbitrum-mainnet";
  }
  return chain;
};

export const getInfuraProvider = (chain: string): providers.BaseProvider => {
  const _chain = chainToInfura(chain);
  const url = `https://${_chain}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`;
  const provider = new providers.JsonRpcProvider(url);
  return provider;
};
