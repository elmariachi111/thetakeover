import { VStack } from "@chakra-ui/react";
import { SellerAccount } from "@prisma/client";
import React from "react";
import { TableItem } from "../atoms/TableItem";

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
