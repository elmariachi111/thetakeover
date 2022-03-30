import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
} from "@chakra-ui/react";
import { User } from "@prisma/client";

const SellerNotConnectedAlert = (props: { creator: User }) => {
  const { creator } = props;
  console.log(creator);
  return (
    <Alert status="warning">
      <AlertIcon />
      <Flex direction="column">
        <AlertTitle mr={2} textTransform="uppercase">
          Sales is not active
        </AlertTitle>
        <AlertDescription fontSize="sm">
          {creator.name || creator.id} is not fully onboarded yet.
        </AlertDescription>
      </Flex>
    </Alert>
  );
};

export { SellerNotConnectedAlert };
