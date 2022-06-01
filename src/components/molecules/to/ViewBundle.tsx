import { Container, Flex, Icon, Image } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import React, { useEffect, useRef } from "react";
import { CgScrollV } from "react-icons/cg";
import ReactMarkdown from "react-markdown";
import { XLink } from "../../../types/Link";
import { TitleAndCreator } from "../../atoms/TitleAndCreator";
import { ViewEmbed } from "./ViewEmbed";
import { ViewExternal } from "./ViewExternal";

export const ViewBundle = (props: {
  link: XLink;
  items: XLink[];
  showChrome: boolean;
  motionDetected: () => void;
}) => {
  const { link, items, showChrome, motionDetected } = props;

  return (
    <Flex
      onScroll={motionDetected}
      direction="column"
      gridGap={12}
      py={24}
      w="100%"
      h="100vh"
      overflowY="scroll"
      style={{ scrollSnapType: "y mandatory" }}
    >
      <Container maxW="container.xl" px={[2, 2, null]}>
        <Flex
          direction="column"
          justify="center"
          py={24}
          align="center"
          gridGap={6}
          style={{ scrollSnapAlign: "start" }}
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
        return (
          <Flex
            key={`bundle-${bundleLink.hash}`}
            position="relative"
            style={{ scrollSnapAlign: "center" }}
          >
            {bundleLink.metadata.oembed ? (
              <ViewEmbed link={bundleLink} showChrome={showChrome} />
            ) : (
              <ViewExternal link={bundleLink} />
            )}
          </Flex>
        );
      })}
    </Flex>
  );
};
