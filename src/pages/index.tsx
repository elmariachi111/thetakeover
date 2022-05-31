import {
  Button,
  Flex,
  Link as ChakraLink,
  SlideFade,
  Spacer,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo } from "react";
import { ToLogo } from "../components/atoms/ToLogo";

const CreateLink: NextPage = () => {
  const { data: session, status } = useSession({
    required: false,
  });

  const salutation = useMemo(() => {
    if (status === "authenticated") {
      return session?.user?.name || session?.user?.email || session?.user?.id;
    }
  }, [session, status]);

  return (
    <Flex direction="column" h="full" align="center">
      <Spacer />
      {status === "authenticated" ? (
        <Flex direction="column" align="center">
          <Text my={3}>
            gm,{" "}
            <Link href="/profile" passHref>
              <ChakraLink>{salutation}</ChakraLink>
            </Link>
          </Text>
          <Link href="/create" passHref>
            <Button as={ChakraLink} to="/create">
              Create a Takeover
            </Button>
          </Link>

          <Link href="/my" passHref>
            <ChakraLink mt={8}>Your Takeovers</ChakraLink>
          </Link>
        </Flex>
      ) : (
        <Flex direction="column" gridGap={4} align="center">
          <SlideFade
            offsetY="-40px"
            in
            delay={0.3}
            transition={{ enter: { duration: 1 } }}
          >
            <ToLogo width={120} />
          </SlideFade>
          <SlideFade
            offsetY="40px"
            in
            delay={0.3}
            transition={{ enter: { duration: 1 } }}
          >
            <Flex direction="column">
              <Link href="/create" passHref>
                <Button as={ChakraLink} to="/create">
                  Create a Takeover
                </Button>
              </Link>

              <Button size="sm" onClick={() => signIn()} variant="link" my={6}>
                Sign in
              </Button>
            </Flex>
          </SlideFade>
        </Flex>
      )}
      <Spacer />
    </Flex>
  );
};

export default CreateLink;
