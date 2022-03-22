import { Flex, Text } from "@chakra-ui/react";
import React from "react";

type XPayment = {
  id: string;
  link_hash: string;
  provider: string;
  paymentRef: string;
  paymentStatus: string;
  initiatedAt: string;
  paidAt: string | null;
};
export const PaymentDisplay = (props: { payment: XPayment }) => {
  const { payment } = props;

  return (
    <Flex direction="column" w="full">
      <Text>{payment.provider}</Text>
    </Flex>
  );
};
