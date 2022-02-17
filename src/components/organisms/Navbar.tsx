import { Button, Container, Drawer, DrawerContent, DrawerOverlay, Flex, IconButton, Link, Spacer, Text, useDisclosure } from "@chakra-ui/react"
import Image from "next/image";
import React from "react";
import logo from '../../img/to_logo.svg';
import LoginComponent from "../LoginComponent";
import {MdMenu} from 'react-icons/md';
import {default as NextLink} from 'next/link'

const Navbar = (params) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  return <Container as={Flex} direction="row" justify="space-between" align="center">
    <NextLink href="/" passHref>
      <Link href="/">
        <Image src={logo} alt="logo" height={60} width={60}></Image>
      </Link>
    </NextLink>
    <Spacer />

    <IconButton onClick={onOpen} aria-label="foo" icon={<MdMenu />} >
        
    </IconButton>
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
    >
      <DrawerOverlay />
      <DrawerContent>
        <LoginComponent />
        <NextLink href="/mytakeovers" passHref>
          <Link onClick={onClose}>
          My Takeovers
          </Link>
        </NextLink>
          
      </DrawerContent>
    </Drawer>
  </Container>
}


export default  Navbar;