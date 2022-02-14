import { Container, Flex } from "@chakra-ui/react";
import Navbar from "./organisms/Navbar";

export default function Layout(props: {
  children: React.ReactNode
}) {
  const {children} = props;
  return (
    <Container w="100%" p="0" h="100vh" as={Flex} direction="column">
      <Navbar />
      {children}
    </Container>
  )
}