import { Fade, Flex } from "@chakra-ui/react";
import React from "react";
import Iframe from "react-iframe";
import { extractEmbedUrl } from "../../../modules/fixEmbed";
import { XLink } from "../../../types/Link";
import { TitleAndCreator } from "../../atoms/TitleAndCreator";

export const ViewEmbed = (props: { link: XLink; showChrome: boolean }) => {
  const { link, showChrome } = props;
  const embed = extractEmbedUrl(link.metadata.embed);

  return (
    <Flex direction="column" w="100vw" minH="100vh">
      <Flex w="100%" h="100%">
        {embed && (
          <Iframe
            url={embed}
            allowFullScreen
            width="100%"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
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
