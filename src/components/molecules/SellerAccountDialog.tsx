import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  CloseButton,
  Collapse,
  Flex,
  Link,
  useDisclosure,
} from "@chakra-ui/react";
import { SellerAccount } from "@prisma/client";
import React, { useEffect } from "react";

const SellerAccountDialog = (props: {
  sellerAccount?: SellerAccount | null;
}) => {
  const { sellerAccount } = props;
  const { isOpen, onClose } = useDisclosure({
    defaultIsOpen: true,
  });

  useEffect(() => {
    if (sellerAccount) {
      setTimeout(onClose, 4000);
    }
  }, [sellerAccount]);

  return (
    <Collapse in={isOpen} animateOpacity style={{ width: "100%" }}>
      {!sellerAccount ? (
        <Alert status="warning" w="100%">
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
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={onClose}
          />
        </Alert>
      ) : (
        <Alert status="success" w="100%">
          <AlertIcon />
          <Flex direction="column">
            <AlertTitle mr={2}>Paypal business account is connected</AlertTitle>
            <AlertDescription>
              You can actively sell content on Takeover.
            </AlertDescription>
          </Flex>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={onClose}
          />
        </Alert>
      )}
    </Collapse>
  );
};

export { SellerAccountDialog };
