import { ChainName } from "../../types/ChainConditions";

export const marketplaceLink = (
  chain: ChainName,
  collection: string
): string | null => {
  if (chain === "ethereum") {
    return `https://looksrare.org/collections/${collection}`;
  }
  if (chain === "polygon") {
    return `https://nftrade.com/assets/polygon/${collection}`;
  }
  if (chain === "rinkeby") {
    return `https://rinkeby.looksrare.org/collections/${collection}`;
  }

  return null;
};
