import { Container, Flex, Image, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

// pages/500.js
export default function Custom500() {
  const [opacity, setOpacity] = useState(0.9);
  useEffect(() => {
    const duration = Math.random() * 1000;
    const to = setTimeout(() => {
      setOpacity((o) => 1.5 - o);
    }, duration);
  }, [opacity]);

  return (
    <Container maxW="container.lg" h="100%">
      <Flex h="full" align="center" justify="center" direction="column">
        <Image
          w="40vw"
          opacity={opacity}
          transition="ease-in-out 300ms"
          src="/to_logo_rgb.png"
          alt="rgb logo"
          transform={`rotate(-3deg)`}
        />
        <Text fontSize="6xl" style={{ transform: "rotate(4deg)" }}>
          Aww, snap.
        </Text>
        <Text fontSize="md" style={{ transform: "rotate(-3deg)" }}>
          That&apos;s an error.
        </Text>
      </Flex>
    </Container>
  );
}
