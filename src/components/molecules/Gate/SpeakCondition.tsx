import { Link, Text } from "@chakra-ui/react";

import { ReactNode, useEffect, useState } from "react";
import { getContractMetadata } from "../../../modules/gate/extractNFTMetadata";
import { marketplaceLink } from "../../../modules/gate/marketplaceLink";
import { getInfuraProvider } from "../../../modules/infura";
import { ChainCondition } from "../../../types/ChainConditions";

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
        console.log("mddd");
        const name = await getContractMetadata(
          provider,
          condition.contractAddress
        );
        if (name) {
          setContractName(name);
        }
      } catch (e: any) {
        console.error(e);
      }
    })();
  }, [condition]);

  const comparator = condition.returnValueTest.comparator;
  const value = parseInt(condition.returnValueTest.value);

  let quantity;
  if (comparator == ">" && value == 0) {
    quantity = "at least one";
  } else {
    quantity = ComparatorMap[comparator].replace("{value}", value);
  }

  const itemType = `${condition.standardContractType} NFT`;

  const link = marketplaceLink(condition.chain, condition.contractAddress);

  const collection = link ? (
    <Link href={link} isExternal>
      {contractName}
    </Link>
  ) : (
    <Text>{contractName}</Text>
  );

  let pluralize: string;
  let quantityItemType: string | ReactNode;
  if (condition.standardContractType === "ERC721") {
    pluralize = value > 1 ? "s" : "";
    quantityItemType = `${quantity} ${itemType}${pluralize}`;
  } else {
    const tokenIds = condition.parameters[1].split(",");
    const tokenLinks = tokenIds.map((id, i) => (
      <>
        <Link
          key={`mplink-${id}`}
          href={marketplaceLink(condition.chain, condition.contractAddress, id)}
          isExternal
        >
          this
        </Link>
        {i + 1 < tokenIds.length ? " or " : ""}
      </>
    ));

    quantityItemType = (
      <>
        {tokenLinks} token{pluralize}
      </>
    );
  }
  return (
    <Text>
      this item can be accessed by holders of {quantityItemType} of {collection}{" "}
      on the {condition.chain} blockchain
    </Text>
  );
};
