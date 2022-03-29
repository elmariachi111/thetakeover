import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  CloseButton,
  Flex,
  Link,
} from "@chakra-ui/react";
import { SellerAccount } from "@prisma/client";
import React from "react";

const SellerAccountDialog = (props: {
  sellerAccount?: SellerAccount | null;
}) => {
  const { sellerAccount } = props;

  return !sellerAccount ? (
    <Alert status="warning">
      <AlertIcon />
      <Flex direction="column">
        <AlertTitle mr={2} textTransform="uppercase">
          Sales is not active
        </AlertTitle>
        <AlertDescription fontSize="sm">
          please{" "}
          <Link href="/api/paypal/onboard" textTransform="none">
            connect a Paypal business account
          </Link>{" "}
          to start selling
        </AlertDescription>
      </Flex>
      <CloseButton position="absolute" right="8px" top="8px" />
    </Alert>
  ) : (
    <Alert status="success">
      <AlertIcon />
      <Flex direction="column">
        <AlertTitle mr={2}>Paypal business account is connected</AlertTitle>
        <AlertDescription>
          You can actively sell content on Takeover.
        </AlertDescription>
      </Flex>
      <CloseButton position="absolute" right="8px" top="8px" />
    </Alert>
  );
};

export { SellerAccountDialog };
