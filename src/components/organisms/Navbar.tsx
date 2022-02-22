import { Button, Container, Drawer, DrawerContent, DrawerOverlay, Flex, IconButton, Link, Spacer, Text, useColorMode, useDisclosure } from "@chakra-ui/react"
import Image from "next/image";
import React from "react";
import logo from '../../img/to_logo.svg';
import LoginComponent from "../LoginComponent";
import { MdMenu } from 'react-icons/md';
import { default as NextLink } from 'next/link'
import { useSession } from "next-auth/react";
import { FaSun } from 'react-icons/fa'

const Navbar = (params) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { status } = useSession();

  const { colorMode, toggleColorMode } = useColorMode()

  return <Container as={Flex} direction="row" justify="space-between" align="center">
    <NextLink href="/" passHref>
      <Link href="/">
        <Image src={logo} alt="logo" height={60} width={60}></Image>
      </Link>
    </NextLink>
    <Spacer />

    <Flex direction="row" align="center" gridGap={4}>
      <IconButton icon={<FaSun size={16} />} color="brand.200" variant="unstyled" size="xs" aria-label=" toggle color mode" onClick={toggleColorMode} />
      <IconButton onClick={onOpen} aria-label="menu" icon={<MdMenu />} />
    </Flex>


    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
    >
      <DrawerOverlay />
      <DrawerContent >
        <Flex direction="column" justify="space-evenly" align="center" height="full">
          <Flex py={3} justify="center">
            <LoginComponent />
          </Flex>
          {status === "authenticated" && <Flex>
            <NextLink href="/my" passHref>
              <Link onClick={onClose}>
                My Takeovers
              </Link>
            </NextLink>
          </Flex>
          }
          <Spacer />
          <Text my={5} textTransform="uppercase">The Takeover</Text>
        </Flex>
      </DrawerContent>
    </Drawer>
  </Container >
}


export default Navbar;