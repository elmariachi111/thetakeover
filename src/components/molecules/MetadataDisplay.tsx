import { Flex, Heading, Image, Text } from "@chakra-ui/react";
import { Metadata } from "@prisma/client";
import React from "react";

export const MetadataDisplay = (props: {
  metadata: Metadata;
  image?: boolean;
}) => {
  const { metadata, image } = props;

  return (
    <Flex direction="column" w="full">
      <Heading size="md" textTransform="uppercase" my={2}>
        {metadata.title}
      </Heading>
      <Text>{metadata.description}</Text>
      {image && <Image src={metadata.previewImage} mt={2} />}
    </Flex>
  );
};
