import { ChainCondition, ChainName } from "../../types/ChainConditions";

const ComparatorMap = {
  "<": "fewer than {value} ",
  "<=": "up to {value} ",
  "=": "exactly {value} ",
  ">": "more than {value} ",
  ">=": "at least {value}",
};

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

export const sayCondition = (condition: ChainCondition) => {
  const comparator = condition.returnValueTest.comparator;
  const value = parseInt(condition.returnValueTest.value);
  console.log(value);

  let quantity;
  if (comparator == ">" && value == 0) {
    quantity = "at least one";
  } else {
    quantity = ComparatorMap[comparator].replace("{value}", value);
  }

  const pluralize = value > 1 ? "s" : "";
  const itemType = `${condition.standardContractType} NFT${pluralize}`;

  const link = marketplaceLink(condition.chain, condition.contractAddress);
  const thisCollection = link
    ? `<a href="${link}" target="_blank" style="text-decoration: underline;">this collection</a>`
    : `this collection ${condition.contractAddress} `;

  let text = `can be accessed 
    by holders of ${quantity} ${itemType}
    of ${thisCollection}
    on the ${condition.chain} blockchain`;

  return text;
};
