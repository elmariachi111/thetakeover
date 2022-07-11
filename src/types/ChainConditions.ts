import { string } from "yup";

export type ConditionType = "evmBasic";

export type ContractType = "ERC721" | "ERC1155" | "POAP";

type EthAddress = string;
export type ChainName = string;
type Comparator = "<" | "<=" | "=" | ">=" | ">" | "!=" | "contains";

interface ConditionReturnValueTest {
  key?: string;
  comparator: Comparator;
  value: string;
}

interface ABIType {
  type: string;
  name: string;
  internalType: string;
}

export interface ConditionABI {
  name: string;
  type: "function";
  stateMutability: "view" | "pure";
  inputs: ABIType[];
  outputs: ABIType[];
}

export interface ChainCondition {
  conditionType: ConditionType;
  contractAddress: EthAddress;
  standardContractType: ContractType;
  chain: ChainName;
  method: string;
  parameters: string[];
  returnValueTest: ConditionReturnValueTest;
  functionName?: string;
  functionParams?: string[];
  functionAbi?: ConditionABI;
}

//https://developer.litprotocol.com/docs/AccessControlConditions/EVM/basicExamples

/*
any nft of this collection:
[
    {
        "conditionType": "evmBasic",
        "contractAddress": "0x2dab4ce3490bb50b2ea4c07ab1b6a9cfe29d89b3",
        "standardContractType": "ERC721",
        "chain": "ethereum",
        "method": "balanceOf",
        "parameters": [
            ":userAddress"
        ],
        "returnValueTest": {
            "comparator": ">=",
            "value": "1"
        }
    }
]
*/
