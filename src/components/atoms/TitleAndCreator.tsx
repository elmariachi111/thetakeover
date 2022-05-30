import { Flex, Heading } from "@chakra-ui/react";
import React from "react";
import { XLink } from "../../types/Link";

export const TitleAndCreator = (props: {
  link: XLink;
  color?: string;
  backdrop?: boolean;
}) => {
  const { link, color, backdrop } = props;
  let backdropProps;
  if (backdrop)
    backdropProps = {
      bg: "black",
      px: 6,
      py: 2,
    };
  else backdropProps = {};

  return (
    <Flex direction="column" align="center">
      <Heading size="lg" color={color} {...backdropProps}>
        {link.creator.name}
      </Heading>
      <Heading size="md" color={color} {...backdropProps}>
        {link.metadata.title}
      </Heading>
    </Flex>
  );
};
