import {
  Flex,
  IconButton,
  Link as ChakraLink,
  LinkBox,
  LinkOverlay,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { Link } from "@prisma/client";
import { default as NextLink } from "next/link";
import { FiEdit2, FiExternalLink } from "react-icons/fi";
import { XLink } from "../../types/Payment";

type XXLink = XLink & Link;
type ToCardLink = XXLink & {
  _count: {
    payments: number;
  };
};

const TakeoverCard = (props: { link: ToCardLink }) => {
  const { link } = props;
  return (
    <LinkBox>
      <Flex
        sx={{ transition: "all 200ms", _hover: { transform: "scale(1.02)" } }}
        direction="column"
        backgroundImage={link.metadata?.previewImage}
        backgroundColor="brand.800"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundBlendMode="lighten"
        minH={275}
        py={2}
        maxW="100%"
      >
        <LinkOverlay href={`/to/${link.hash}`}>
          <Flex direction="row" w="full" my={3}>
            <Text
              px={3}
              py={2}
              lineHeight="2rem"
              background="brand.500"
              color="white"
              maxW="75%"
            >
              {link.metadata ? link.metadata.title : link.hash}
            </Text>
            <Spacer />
            <Flex direction="row" justify="space-between">
              <NextLink href={`/to/edit/${link.hash}`} passHref>
                <IconButton aria-label="edit" icon={<FiEdit2 />} />
              </NextLink>
              <ChakraLink isExternal href={link.originUri}>
                <IconButton aria-label="visit" icon={<FiExternalLink />} />
              </ChakraLink>
            </Flex>
          </Flex>
        </LinkOverlay>
        <Flex direction="row" position="absolute" right={0} bottom={0}>
          {/* <Image src={} fit="contain" maxW="300" /> */}
          <Flex>
            <Text
              color="white"
              fontSize="lg"
              background="brand.500"
              py={2}
              px={2}
            >
              €{link.price}
            </Text>
            {/* <Text>{link._count.payments}</Text> */}
          </Flex>
        </Flex>
      </Flex>
    </LinkBox>
  );
};

export { TakeoverCard };
