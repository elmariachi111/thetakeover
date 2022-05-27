import {
  Button,
  Container,
  Flex,
  Image,
  Link as ChakraLink,
} from "@chakra-ui/react";
import React from "react";
import { XLink } from "../../../types/Link";
import { TitleAndCreator } from "../../atoms/TitleAndCreator";

export const ViewExternal = (props: { link: XLink }) => {
  const { link } = props;
  return (
    <Container maxW="container.xl" px={[2, 2, null]}>
      <Flex
        direction="column"
        justify="center"
        w="100%"
        h="100vh"
        align="center"
        gap={12}
      >
        <TitleAndCreator link={link} />
        {link.metadata.previewImage && (
          <Image
            src={link.metadata.previewImage}
            alt={link.metadata.description}
          />
        )}
        <Button as={ChakraLink} href={link.originUri}>
          proceed to content
        </Button>
      </Flex>
    </Container>
  );
};
