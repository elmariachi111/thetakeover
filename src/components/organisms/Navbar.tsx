import { Container, Flex, Text } from "@chakra-ui/react"
import Image from "next/image";
import logo from '../../img/to_logo.svg';
import LoginComponent from "../LoginComponent";

const Navbar = (params) => {
  return <Container as={Flex} direction="row" justify="space-between" align="center">
    <Image src={logo} alt="logo" height={60} width={60}></Image>
    <LoginComponent />
  </Container>
}


export default  Navbar;