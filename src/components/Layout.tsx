import { Container, Flex } from "@chakra-ui/react";
import Navbar from "./organisms/Navbar";

export default function Layout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <Container
      w="100vw"
      p="0"
      h="100vh"
      as={Flex}
      direction="column"
      pl={2}
      pr={2}
    >
      <Navbar />
      {children}
    </Container>
  );
}
