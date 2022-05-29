import { Flex, Icon, Spacer, Text } from "@chakra-ui/react";
import React from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

export const TableItem = ({
  label,
  value,
  negative,
}: {
  label: string;
  value: string | number | null | boolean;
  negative?: boolean;
}) => {
  return (
    <Flex w="100%" direction="row">
      <Text fontWeight="bold">{label}</Text>
      <Spacer />
      <Text color={negative === true ? "red" : "inherit"}>
        {typeof value === "boolean" ? (
          <Icon
            fontSize="lg"
            as={value ? FiCheckCircle : FiXCircle}
            color={value ? "green.500" : "red.300"}
          />
        ) : (
          value
        )}
      </Text>
    </Flex>
  );
};
