import { Container, Flex, Icon, Image, Spacer, Text } from "@chakra-ui/react";
import React from "react";
import { extractEmbedUrl } from "../../../modules/fixEmbed";
import { XLink } from "../../../types/Link";
import { TitleAndCreator } from "../../atoms/TitleAndCreator";
import { ViewEmbed } from "./ViewEmbed";
import { ViewExternal } from "./ViewExternal";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { CgScrollV } from "react-icons/cg";

export const ViewBundle = (props: { link: XLink; items: XLink[] }) => {
  const { link, items } = props;

  return (
    <Flex direction="column" w="100%" gridGap={12} py={24}>
      <Container maxW="container.xl" px={[2, 2, null]}>
        <Flex
          direction="column"
          justify="center"
          w="100%"
          minH="100vh"
          align="center"
          position="relative"
          my={20}
          gridGap={6}
        >
          <TitleAndCreator link={link} />
          {link.metadata.previewImage && (
            <Image src={link.metadata.previewImage} alt={link.metadata.title} />
          )}
          <ReactMarkdown
            components={ChakraUIRenderer()}
            // eslint-disable-next-line react/no-children-prop
            children={link.metadata.description}
            skipHtml
          />

          <Icon as={CgScrollV} w={12} h={12} mt={24} />
        </Flex>
      </Container>
      {items.map((bundleLink) => {
        const embed = extractEmbedUrl(bundleLink.metadata.embed);
        return (
          <Flex key={`bundle-${bundleLink.hash}`} w="100%" position="relative">
            {embed ? (
              <ViewEmbed link={bundleLink} />
            ) : (
              <ViewExternal link={bundleLink} />
            )}
          </Flex>
        );
      })}
    </Flex>
  );
};
