import { Container, Flex, useColorMode } from "@chakra-ui/react";
import Navbar from "./organisms/Navbar";
import bgpoly from "../img/bgpoly.png";

export default function Layout(props: { children: React.ReactNode }) {
  const { children } = props;
  const { colorMode } = useColorMode();

  return (
    <Container
      maxW="container.md"
      p="0"
      h="100vh"
      as={Flex}
      direction="column"
      pl={2}
      pr={2}
      backgroundRepeat="no-repeat"
      backgroundImage={colorMode == "dark" ? bgpoly.src : "none"}
      backgroundPosition={["20% -15%", "20% -25%", "20% -50%"]}
    >
      <Navbar />
      {children}
    </Container>
  );
}
