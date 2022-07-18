import parsePath from "parse-path";
import { ChainName, translateChain } from "../../types/ChainConditions";

const HEX_NUMBERS = new RegExp(`^([a-f\\d])+$`, "g");

const isNumeric = (num: string) => {
  return num.match(/^\d+$/);
};

const isHexNumber = (num: string) => {
  return num.match(/^0x([A-Fa-f\d])+$/);
};

type ExtractedNFT = {
  chain: ChainName;
  collection: string;
  tokenId?: string;
};

export const extractNFTFromMarketPlace = (
  marketplaceLink: string
): ExtractedNFT | null => {
  //const NFT_ASSET_URL = new RegExp(`(0x\\w+)[/:](\\d+)`, "gi");
  const url = parsePath(marketplaceLink);

  const path = url.pathname.split("/").reverse();

  const extracted: ExtractedNFT = {
    chain: "ethereum",
    collection: "",
  };

  if (isNumeric(path[0]) && isHexNumber(path[1])) {
    extracted.collection = path[1];
    extracted.tokenId = path[0];
    if (Object.keys(translateChain).includes(path[2])) {
      extracted.chain = translateChain[path[2]];
    }
  } else if (isHexNumber(path[0])) {
    extracted.collection = path[0];
    if (path[2] == "collection") {
      extracted.chain = translateChain[path[1]];
    }
  }

  const domain = url.resource.split(".");
  if (domain.length >= 3 && Object.keys(translateChain).includes(domain[0])) {
    extracted.chain = translateChain[domain[0]];
  }

  if (!extracted.chain || !extracted.collection) {
    throw new Error("no extractable information");
  }

  if (!extracted.collection.startsWith("0x")) {
    throw "collection not hex";
  }

  if (extracted.collection.length != 42) {
    throw "collection not an address";
  }

  if (extracted.tokenId && !extracted.tokenId.match(HEX_NUMBERS)) {
    throw "given token id not numeric";
  }

  return extracted;
};
