import {
  Flex,
  Icon,
  IconButton,
  Link as ChakraLink,
  LinkBox,
  LinkOverlay,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { Link } from "@prisma/client";
import { default as NextLink } from "next/link";
import { FiEdit2, FiExternalLink, FiPause } from "react-icons/fi";
import { XLink } from "../../types/Payment";
import { BundleSelect } from "../atoms/BundleSelect";

type XXLink = XLink & Link;
type ToCardLink = XXLink & {
  _count: {
    payments: number;
  };
  bundles: Partial<XXLink>[];
};

const TakeoverCard = (props: {
  link: ToCardLink;
  onSelect: (hash: string) => void;
  isSelected: boolean;
}) => {
  const { link, onSelect, isSelected } = props;

  return (
    <LinkBox
      minH={275}
      borderColor="black"
      sx={{
        transition: "all 100ms",
        _hover: { borderWidth: "2px" },
      }}
    >
      <LinkOverlay href={`/to/${link.hash}`}>
        <Flex
          position="absolute"
          backgroundImage={link.metadata?.previewImage}
          backgroundColor="black"
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundBlendMode={
            link.saleStatus === "ON_SALE" ? "normal" : "luminosity"
          }
          py={2}
          height="100%"
          width="100%"
        />
        <Flex direction="row" w="100%" my={3}>
          <Text
            px={4}
            py={2}
            lineHeight="2rem"
            background="black"
            color="white"
            maxW="75%"
            ml="-2px"
            zIndex={1}
          >
            {link.metadata ? link.metadata.title : link.hash}
          </Text>
          <Spacer />
        </Flex>
      </LinkOverlay>
      <Flex
        direction="row"
        justify="space-between"
        position="absolute"
        right="0"
        top={2}
      >
        <NextLink href={`/to/edit/${link.hash}`} passHref>
          <IconButton aria-label="edit" icon={<FiEdit2 />} />
        </NextLink>
        {link.originUri && (
          <ChakraLink isExternal href={link.originUri}>
            <IconButton aria-label="visit" icon={<FiExternalLink />} />
          </ChakraLink>
        )}
        {link.bundles.length === 0 && (
          <BundleSelect
            id={link.hash}
            isSelected={isSelected}
            select={onSelect}
          />
        )}
      </Flex>

      <Flex direction="row" position="absolute" right={0} bottom={0}>
        {/* <Image src={} fit="contain" maxW="300" /> */}
        <Flex background="gray.900" color="white" py={2} px={4}>
          {link.saleStatus === "ON_SALE" ? (
            <Text>€{link.price}</Text>
          ) : (
            <Flex direction="row" align="center" gap={1}>
              <Icon as={FiPause} />
              <Text fontSize="sm">paused</Text>
            </Flex>
          )}

          {/* <Text>{link._count.payments}</Text> */}
        </Flex>
      </Flex>
    </LinkBox>
  );
};

export { TakeoverCard };
