import { Container, Flex, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import LoginComponent from "../components/LoginComponent";

const Home: NextPage = () => {
  return (
    <Container>
      <Heading size="xl">a heading</Heading>
      <Flex>
        <LoginComponent />
      </Flex>
    </Container>
  );
};

export default Home;
