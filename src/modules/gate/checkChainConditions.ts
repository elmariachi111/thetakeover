import { ethers, providers } from "ethers";
import { DefaultUser } from "next-auth";
import { ChainCondition } from "../../types/ChainConditions";
import erc721abi from "../abi/erc721.json";

type Against = {
  user: DefaultUser & {
    id: string;
    eth?: string;
  };
};

const ComparatorMap = {
  "<": "lt",
  "<=": "lte",
  "=": "eq",
  ">": "gt",
  ">=": "gte",
};

const getProvider = (chain: string): providers.BaseProvider => {
  chain = chain == "ethereum" ? "mainnet" : chain;

  const url = `https://${chain}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`;
  const provider = new ethers.providers.JsonRpcProvider(url);
  return provider;
};

const matchesCondition = (
  value: string,
  condition: ChainCondition
): boolean => {
  const _val = ethers.BigNumber.from(value);
  const _cmp = ethers.BigNumber.from(condition.returnValueTest.value);
  const comparator = ComparatorMap[condition.returnValueTest.comparator];
  const result = _val[comparator](_cmp);
  console.log(_val.toString(), comparator, _cmp.toString(), result);
  return result;
};

const checkCondition = async (condition: ChainCondition, against: Against) => {
  if (condition.conditionType !== "evmBasic")
    throw new Error(`unk condition type ${condition.conditionType}`);

  const provider = getProvider(condition.chain);

  condition.standardContractType;

  const contract = new ethers.Contract(
    condition.contractAddress,
    erc721abi,
    provider
  );

  console.log("against", against);

  const resolvedParameters = condition.parameters.map((p) =>
    p === ":userAddress" ? against.user.eth : p
  );

  console.debug(
    `checking condition with parameters `,
    condition,
    resolvedParameters
  );

  const returnValue = await contract[condition.method](...resolvedParameters);
  console.log(returnValue);

  const matches = matchesCondition(returnValue, condition);
  return matches;
};

const checkChainConditions = async (
  conditions: ChainCondition[],
  against: Against
) => {
  const result = await checkCondition(conditions[0], against);
  return result;
};

export { checkChainConditions };
