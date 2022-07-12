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
    <GeneralAlert status="info" title="Fiat payments are not available yet">
      {creator.name || creator.id} is not fully onboarded.
    </GeneralAlert>
  );
};

export { SellerNotConnectedAlert };
