import { Link, Text } from "@chakra-ui/react";
import { ethers } from "ethers";

import React, { useEffect, useState } from "react";
import { marketplaceLink } from "../../../modules/gate/marketplaceLink";
import { getInfuraProvider } from "../../../modules/infura";
import { ChainCondition } from "../../../types/ChainConditions";

import erc712abi from "../../../modules/abi/erc721.json";

const ComparatorMap = {
  "<": "fewer than {value} ",
  "<=": "up to {value} ",
  "=": "exactly {value} ",
  ">": "more than {value} ",
  ">=": "at least {value}",
};

export const SpeakCondition = (props: { conditions: ChainCondition[] }) => {
  const { conditions } = props;
  const condition = conditions[0];

  const [contractName, setContractName] = useState<string>(
    condition.contractAddress
  );
  useEffect(() => {
    (async () => {
      try {
        const provider = getInfuraProvider(condition.chain);
        const contract = new ethers.Contract(
          condition.contractAddress,
          erc712abi,
          provider
        );
        const result = await contract.name();
        console.log(result);
        setContractName(result);
      } catch (e: any) {
        console.error(e);
      }
    })();
  }, [condition.chain, condition.contractAddress]);

  const comparator = condition.returnValueTest.comparator;
  const value = parseInt(condition.returnValueTest.value);

  let quantity;
  if (comparator == ">" && value == 0) {
    quantity = "at least one";
  } else {
    quantity = ComparatorMap[comparator].replace("{value}", value);
  }

  const pluralize = value > 1 ? "s" : "";
  const itemType = `${condition.standardContractType} NFT${pluralize}`;

  const link = marketplaceLink(condition.chain, condition.contractAddress);

  const collection = link ? (
    <Link href={link} isExternal>
      {contractName}
    </Link>
  ) : (
    <Text>{contractName}</Text>
  );

  return (
    <Text>
      this item can be accessed by holders of {quantity} {itemType} of{" "}
      {collection} on the {condition.chain} blockchain
    </Text>
  );
};
