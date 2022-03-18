import { Flex, Heading, Image, Text } from "@chakra-ui/react";
import { Metadata } from "@prisma/client";
import React from "react";

export const MetadataDisplay = (props: { metadata: Metadata }) => {
  const { metadata } = props;
  console.log(metadata);
  return (
    <Flex direction="column">
      <Heading size="md" textTransform="uppercase" my={2}>
        {metadata.title}
      </Heading>
      <Text>{metadata.description}</Text>
      <Image src={metadata.previewImage} mt={2} />
    </Flex>
  );
};
