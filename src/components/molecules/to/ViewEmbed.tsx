import { Fade, Flex, Text } from "@chakra-ui/react";
import React from "react";
import Iframe from "react-iframe";
import { extractEmbedUrl } from "../../../modules/fixEmbed";
import { XLink } from "../../../types/Link";
import { TitleAndCreator } from "../../atoms/TitleAndCreator";

export const ViewEmbed = (props: { link: XLink; showChrome: boolean }) => {
  const { link, showChrome } = props;

  const embedUrl = link.metadata.oembed
    ? extractEmbedUrl(link.metadata.oembed.html)
    : null;

  return (
    <Flex direction="column" w="100vw" minH="100vh">
      <Flex w="100%" h="100%">
        {embedUrl ? (
          <Iframe
            url={embedUrl}
            allowFullScreen
            width="100%"
            height="100%"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <Text>no embed found</Text>
        )}
      </Flex>

      <Flex
        position="absolute"
        bottom={5}
        alignSelf="center"
        alignItems="center"
        direction="column"
      >
        <Fade in={showChrome} unmountOnExit>
          <TitleAndCreator link={link} color="white" backdrop />
        </Fade>
      </Flex>
    </Flex>
  );
};
