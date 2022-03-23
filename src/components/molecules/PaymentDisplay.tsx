import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { XPayment } from "../../types/Payment";

export const PaymentDisplay = (props: { payment: XPayment }) => {
  const { payment } = props;

  return (
    <Flex direction="column" w="full">
      <Text>{payment.provider}</Text>
    </Flex>
  );
};
