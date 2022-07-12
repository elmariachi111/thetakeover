import {
  Flex,
  IconButton,
  Link as ChakraLink,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { default as NextLink } from "next/link";
import {
  FiEdit2,
  FiExternalLink,
  FiLink,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { ToCardLink } from "../../types/Link";
import { BundleSelect } from "../atoms/BundleSelect";

const TakeoverCard = (props: {
  link: ToCardLink;
  onSelect: (hash: string) => void;
  onRemove: (hash: string) => void;
  isSelected: boolean;
}) => {
  const { link, onSelect, isSelected } = props;

  return (
    <Flex
      bg="gray.800"
      p={4}
      justify="space-between"
      align="center"
      _hover={{
        backgroundImage: link.metadata?.previewImage,
        backgroundColor: "gray.800",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode:
          link.saleStatus === "ON_SALE" ? "soft-light" : "luminosity",
      }}
    >
      <Flex gap={0} align="center">
        {link.bundles.length === 0 && (
          <BundleSelect
            id={link.hash}
            isSelected={isSelected}
            select={onSelect}
          />
        )}
        <Flex direction="column" align="flex-start">
          <Flex gap={2} align="center" fontSize="xs">
            <Text>{new Date(link.createdAt).toLocaleDateString()}</Text>
            {link.saleStatus === "ON_SALE" && (
              <Text fontWeight="bold">€{link.price}</Text>
            )}
            <Text>{link._count.payments} downloads</Text>
          </Flex>
          <Text noOfLines={1}>{link.metadata?.title}</Text>
        </Flex>
      </Flex>
      <Menu>
        <MenuButton
          as={IconButton}
          variant="ghost"
          icon={<HiDotsVertical size={20} />}
        />

        <MenuList>
          <NextLink href={`/to/edit/${link.hash}`}>
            <MenuItem icon={<FiEdit2 />}>Edit</MenuItem>
          </NextLink>
          <NextLink href={`/to/${link.hash}`}>
            <MenuItem icon={<FiLink />}>Visit</MenuItem>
          </NextLink>
          <NextLink href={`/to/pay/${link.hash}`}>
            <MenuItem icon={<FiShoppingCart />}>Landing page</MenuItem>
          </NextLink>
          {link.originUri && (
            <ChakraLink isExternal href={link.originUri}>
              <MenuItem icon={<FiExternalLink />}>Go to Original</MenuItem>
            </ChakraLink>
          )}
          {link._count.payments === 0 && (
            <MenuItem
              onClick={() => props.onRemove(link.hash)}
              color="red"
              icon={<FiTrash2 />}
            >
              Delete
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </Flex>
  );
};

export { TakeoverCard };
