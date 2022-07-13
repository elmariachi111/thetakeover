import { Container, Flex, Image, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

// pages/500.js
export default function Custom500() {
  const [pos, setPos] = useState([25, 40, 1]);
  useEffect(() => {
    const to = setTimeout(() => {
      setPos((o) => [Math.random() * 80, Math.random() * 80, Math.random()]);
    }, 4000);
  }, [pos]);

  return (
    <Container maxW="container.lg" h="100%">
      <Flex h="full" align="center" justify="center" direction="column">
        <Flex w="100vw" h="40vh" position="relative">
          <Flex
            left={`${pos[0]}%`}
            top={`${pos[1]}%`}
            position="absolute"
            transition="ease-in-out 700ms"
            transform={`scale(${pos[2]})`}
          >
            <Text fontWeight="extrabold" fontSize="9xl">
              404
            </Text>
          </Flex>
        </Flex>
        <Text fontSize="5xl">Uh,wow!</Text>
        <Text fontSize="md">We&apos;ve never seen this page ourselves...</Text>
      </Flex>
    </Container>
  );
}
