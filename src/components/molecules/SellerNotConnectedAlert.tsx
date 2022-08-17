import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
} from "@chakra-ui/react";
import { User } from "@prisma/client";
import { GeneralAlert } from "../atoms/GeneralAlert";

const SellerNotConnectedAlert = (props: { creator: User }) => {
  const { creator } = props;

  return (
    <GeneralAlert status="info" title="Fiat payments are not available.">
      {creator.name || creator.id} has not enabled fiat payments for this item.
    </GeneralAlert>
  );
};

export { SellerNotConnectedAlert };
