import { ethers, providers } from "ethers";
import { DefaultUser } from "next-auth";
import { ChainCondition } from "../../types/ChainConditions";
import erc721abi from "../abi/erc721.json";
import erc1155abi from "../abi/erc1155.json";
import { getInfuraProvider } from "../infura";
import { replaceAll } from "../strings";

type Against = {
  user: DefaultUser & {
    id: string;
    eth?: string;
  };
};

type AbiItem = {
  name: string;
  stateMutability: string;
  type: string; //"function" | "event" | "error";
  inputs: Array<{
    internalType: string;
    name: string;
    type: string;
  }>;
  outputs: Array<{
    internalType: string;
    name: string;
    type: string;
  }>;
};

const ComparatorMap = {
  "<": "lt",
  "<=": "lte",
  "=": "eq",
  ">": "gt",
  ">=": "gte",
};

const matchesCondition = (
  value: string,
  condition: ChainCondition
): boolean => {
  if (condition.returnValueTest.comparator === "=") {
    return value == condition.returnValueTest.value;
  }

  const _val = ethers.BigNumber.from(value);
  const _cmp = ethers.BigNumber.from(condition.returnValueTest.value);
  const comparator = ComparatorMap[condition.returnValueTest.comparator];
  const result = _val[comparator](_cmp);
  //console.log(_val.toString(), comparator, _cmp.toString(), result);
  return result;
};

const checkCondition = async (condition: ChainCondition, against: Against) => {
  if (condition.conditionType !== "evmBasic") {
    //todo this seems to be obsolete
    throw new Error(`unk condition type ${condition.conditionType}`);
  }

  const abi: AbiItem[] =
    condition.standardContractType === "ERC721" ? erc721abi : erc1155abi;

  const functionDefinition = abi.find(
    (a) => a.name === condition.method && a.type === "function"
  );
  if (!functionDefinition)
    throw `function ${condition.method} not found on ${condition.standardContractType}`;

  const args = condition.parameters.map((parameter, i) => {
    let arg =
      typeof parameter === "string"
        ? replaceAll(parameter, ":userAddress", against.user.eth!)
        : parameter;

    if (functionDefinition.inputs[i].type.endsWith("[]")) {
      return arg.split(",");
    } else {
      return arg;
    }
  });

  console.debug("calling contract with", args);

  const provider = getInfuraProvider(condition.chain);
  const contract = new ethers.Contract(
    condition.contractAddress,
    abi,
    provider
  );

  const returnValue = await contract[condition.method](...args);

  console.debug("contract returned", returnValue);

  if (Array.isArray(returnValue)) {
    const first = returnValue.find((val, i) => {
      return matchesCondition(val, condition);
    });
    return !!first;
  } else {
    return matchesCondition(returnValue, condition);
  }
};

export const checkChainConditions = async (
  conditions: ChainCondition[],
  against: Against
) => {
  const result = await checkCondition(conditions[0], against);
  return result;
};
