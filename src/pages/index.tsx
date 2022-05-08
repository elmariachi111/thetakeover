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
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import logo from "../img/to_logo.svg";

const CreateLink: NextPage = () => {
  const { data: session, status } = useSession({
    required: false,
  });

  const salutation = useMemo(() => {
    if (status === "authenticated") {
      if (session) {
        if (session.user) {
          return (
            "gm, " +
            (session.user.name || session.user.email || session.user.id)
          );
        } else {
          return "gm.";
        }
      }
    } else {
      return "gm, please";
    }
  }, [session, status]);

  return (
    <Flex direction="column" h="full" align="center">
      <Spacer />
      {status === "authenticated" ? (
        <Flex direction="column" align="center">
          <Text my={3}>{salutation}</Text>
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
            <Image src={logo} alt="logo" height={120} width={120}></Image>
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
