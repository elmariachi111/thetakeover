import { Divider, Flex, Text } from "@chakra-ui/react";
import React from "react";

export const TextDivider = ({ children }) => (
  <Flex direction="row" align="center" gridGap={5} my={6}>
    <Divider orientation="horizontal" />
    <Text>{children}</Text>
    <Divider orientation="horizontal" />
  </Flex>
);
