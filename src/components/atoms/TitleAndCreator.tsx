import { Flex, Heading } from "@chakra-ui/react";
import React from "react";
import { XLink } from "../../types/Link";

export const TitleAndCreator = (props: { link: XLink; color?: string }) => {
  const { link, color } = props;
  return (
    <Flex direction="column" align="center">
      <Heading size="lg" color={color}>
        {link.creator.name}
      </Heading>
      <Heading size="md" color={color}>
        {link.metadata.title}
      </Heading>
    </Flex>
  );
};
