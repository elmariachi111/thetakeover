import { ChainName } from "../../types/ChainConditions";

export const marketplaceLink = (
  chain: ChainName,
  collection: string,
  tokenId?: string
): string | undefined => {
  let base: string | undefined;

  if (tokenId) {
    if (chain === "ethereum") {
      return `https://opensea.io/assets/${collection}/${tokenId}`;
    }
    if (chain === "polygon") {
      return `https://opensea.io/assets/matic/${collection}/${tokenId}`;
    }
    if (chain === "rinkeby") {
      return `https://rinkeby.looksrare.org/collections/${collection}/${tokenId}`;
    }
  } else {
    if (chain === "ethereum") {
      return `https://looksrare.org/collections/${collection}`;
    }
    if (chain === "polygon") {
      return `https://nftrade.com/assets/polygon/${collection}`;
    }
    if (chain === "rinkeby") {
      return `https://rinkeby.looksrare.org/collections/${collection}`;
    }
  }

  return undefined;
};
