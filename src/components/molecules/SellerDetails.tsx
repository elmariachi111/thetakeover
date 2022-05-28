import { Flex, Icon, Spacer, Text, VStack } from "@chakra-ui/react";
import { SellerAccount } from "@prisma/client";
import React from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const TableItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | boolean;
}) => {
  return (
    <Flex w="100%" direction="row">
      <Text fontWeight="bold">{label}</Text>
      <Spacer />
      <Text>
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

export const SellerAccountView = ({
  sellerAccount,
}: {
  sellerAccount: SellerAccount;
}) => {
  return (
    <VStack gap={3}>
      <TableItem
        label="Paypal Merchant Id"
        value={sellerAccount.merchantIdInPayPal}
      />
      <TableItem
        label="Paypal account Status"
        value={sellerAccount.accountStatus}
      />
      <TableItem
        label="Paypal permissions granted"
        value={sellerAccount.permissionsGranted}
      />
      <TableItem
        label="Paypal Consent given"
        value={sellerAccount.consentStatus}
      />
      <TableItem
        label="Email confirmed"
        value={sellerAccount.isEmailConfirmed}
      />
      <TableItem label="Account verified" value={sellerAccount.isActive} />
    </VStack>
  );
};
