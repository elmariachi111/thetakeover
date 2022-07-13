import { ethers, providers } from "ethers";

import erc165abi from "../abi/erc165.json";
import erc721abi from "../abi/erc721.json";

//https://github.com/OpenZeppelin/openzeppelin-contracts/issues/840
//https://eips.ethereum.org/EIPS/eip-1155
const INTERFACE_ERC1155 = "0xd9b67a26";
//https://eips.ethereum.org/EIPS/eip-721
const INTERFACE_ERC721 = "0x80ac58cd";
const INTERFACE_ERC721_ENUMERABLE = "0x780e9d63";
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
  if (await erc165.supportsInterface(INTERFACE_ERC721_ENUMERABLE)) {
    return "ERC721";
  }
  return null;
};

export const getContractMetadata = async (
  provider: providers.BaseProvider,
  contractAddress
) => {
  const contract = new ethers.Contract(contractAddress, erc721abi, provider);
  return contract.name();
};
