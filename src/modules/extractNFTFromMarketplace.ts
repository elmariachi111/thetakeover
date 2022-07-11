import { ethers, providers } from "ethers";
import parsePath from "parse-path";
import erc165abi from "./abi/erc165.json";

const HEX_NUMBERS = new RegExp(`^([a-f\\d])+$`, "g");
export const extractNFTFromMarketPlace = (
  marketplaceLink: string
): {
  chain: string;
  collection: string;
  tokenId: string;
} | null => {
  //const NFT_ASSET_URL = new RegExp(`(0x\\w+)[/:](\\d+)`, "gi");
  const url = parsePath(marketplaceLink);
  const pathParts = url.pathname.split("/");

  let chain = pathParts.at(-3);
  if (chain === "assets" || chain === "collections") {
    chain = "ethereum";
  } else if (chain === "matic") {
    chain = "polygon";
  }
  const extracted = {
    chain: chain || "",
    collection: pathParts.at(-2) || "",
    tokenId: pathParts.at(-1) || "",
  };

  if (!extracted.chain || !extracted.collection || !extracted.tokenId) {
    return null;
  }

  if (!extracted.collection.startsWith("0x")) {
    return null;
  }

  if (extracted.collection.length != 42) {
    return null;
  }

  if (!extracted.tokenId.match(HEX_NUMBERS)) {
    return null;
  }

  return extracted;
};

//https://eips.ethereum.org/EIPS/eip-1155
const INTERFACE_ERC1155 = "0xd9b67a26";
//https://eips.ethereum.org/EIPS/eip-721
const INTERFACE_ERC721 = "0x780e9d63";
//metadata?!:
//0x80ac58cd

type NFT_TYPE = "ERC721" | "ERC1155";

export const getContractType = async (
  provider: providers.BaseProvider,
  contractAddress
): Promise<NFT_TYPE | null> => {
  const erc165 = new ethers.Contract(contractAddress, erc165abi, provider);

  if (await erc165.supportsInterface(INTERFACE_ERC721)) {
    return "ERC721";
  }
  if (await erc165.supportsInterface(INTERFACE_ERC1155)) {
    return "ERC1155";
  }
  return null;
};
