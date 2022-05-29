import {
  Button,
  Container,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Link,
  Spacer,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { default as NextLink } from "next/link";
import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { FiPlusSquare } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { ToLogo } from "../atoms/ToLogo";
import LoginComponent from "../LoginComponent";

const Navlink = (props: {
  href: string;
  children: string | React.ReactNode;
  onClose?: () => void;
}) => {
  const { onClose, href, children } = props;
  return (
    <NextLink href={href} passHref>
      <Link
        onClick={onClose}
        _hover={{ background: "gray.600", color: "white" }}
        d="flex"
        w="full"
        fontWeight="bold"
        p={3}
      >
        {children}
      </Link>
    </NextLink>
  );
};
const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { status } = useSession();

  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <Container
      maxW="100%"
      as={Flex}
      direction="row"
      justify="space-between"
      align="center"
      px={0}
      py={2}
    >
      <Flex
        direction="row"
        align="center"
        gridGap={3}
        sx={{ transition: "all 200ms", _hover: { transform: "scale(1.03)" } }}
      >
        <ToLogo />
        <Text fontWeight="bold" fontSize="xl">
          The Takeover
        </Text>
      </Flex>
      <Spacer />
      <Flex direction="row">
        <NextLink href="/create" passHref>
          <IconButton
            variant="ghost"
            aria-label="create"
            icon={<FiPlusSquare />}
          />
        </NextLink>

        <IconButton
          onClick={onOpen}
          variant="ghost"
          aria-label="menu"
          icon={<HiDotsVertical />}
        />
      </Flex>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={colorMode === "light" ? "white" : "gray.900"}>
          <Flex
            direction="column"
            justify="space-evenly"
            align="center"
            height="full"
          >
            <Flex
              py={5}
              align="center"
              justify="center"
              w="100%"
              position="relative"
            >
              <LoginComponent />
              <IconButton
                position="absolute"
                right="2px"
                icon={colorMode === "dark" ? <FaSun /> : <FaMoon />}
                variant="ghost"
                aria-label="toggle color mode"
                onClick={toggleColorMode}
              />
            </Flex>
            {status === "authenticated" && (
              <Flex
                w="full"
                my={6}
                align="flex-start"
                direction="column"
                gridGap={2}
              >
                <Navlink onClose={onClose} href="/my">
                  Your Takeovers
                </Navlink>
                <Navlink onClose={onClose} href="/sales">
                  Sales Overview
                </Navlink>
                <Navlink onClose={onClose} href="/create">
                  Create a Takeover
                </Navlink>
              </Flex>
            )}
            <Spacer />
            <Flex direction="column" w="100%" align="center">
              {status === "authenticated" && (
                <Button onClick={() => signOut()} w={3 / 5}>
                  Sign out
                </Button>
              )}

              <Flex direction="row" fontSize="small" gap={3} my={5}>
                <Link isExternal href="https://the-takeover.com/">
                  The Takeover
                </Link>
                <Link isExternal href="https://the-takeover.com/impressum-to">
                  Imprint
                </Link>
                <Link isExternal href="https://the-takeover.com/datenschutz-to">
                  Privacy
                </Link>
              </Flex>
            </Flex>
          </Flex>
        </DrawerContent>
      </Drawer>
    </Container>
  );
};

export default Navbar;
