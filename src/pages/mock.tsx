import { Flex, Heading } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import ShareModal from "lit-share-modal-v3";

const Mock: NextPage = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const onUnifiedAccessControlConditionsSelected = (shareModalOutput) => {
    console.log("UFF", shareModalOutput);
  };
  const [inBrowser, setInBrowser] = useState(false);
  useEffect(() => {
    setInBrowser(true);
  }, []);

  return (
    <Flex direction="column" align="center">
      <Heading my={6}>Edit NFT conditions</Heading>
      {inBrowser && (
        <Flex h="700px" w="500px">
          <ShareModal
            permanent={false}
            isModal={false}
            chainsAllowed={[
              "ethereum",
              "arbitrum",
              "optimism",
              "polygon",
              "xdai",
              "goerli",
              "rinkeby",
            ]}
            allowMultipleConditions={false}
            darkTheme={true}
            onClose={() => {
              setShowShareModal(false);
            }}
            onUnifiedAccessControlConditionsSelected={
              onUnifiedAccessControlConditionsSelected
            }
          />
        </Flex>
      )}
    </Flex>
  );
};

//Mock.auth = true;

export default Mock;
