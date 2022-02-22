import { Button, Flex, Link as ChakraLink, SlideFade, Spacer, Text } from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import NewLink from "../components/organisms/NewLink";
import { LinkPayload } from "../types/LinkPayload";
import logo from '../img/to_logo.svg';
import Image from "next/image";


const CreateLink: NextPage = () => {

  const { data: session, status } = useSession({
    required: false
  });

  return (
    <Flex direction="column" h="full" align="center">
      <Spacer />
      {status === "authenticated" ?
        <Flex direction="column" align="center" >
          <Text my={3}>gm, {session?.user?.name}</Text>
          <Link href="/create" passHref>
            <Button as={ChakraLink} to="/create">Create a Takeover</Button>
          </Link>
        </Flex>
        :
        <Flex direction="column" gridGap={4} align="center">
          <SlideFade offsetY="-40px" in delay={0.3} transition={{ enter: { duration: 1 } }}>
            <Image src={logo} alt="logo" height={120} width={120}></Image>
          </SlideFade>
          <SlideFade offsetY="40px" in delay={0.3} transition={{ enter: { duration: 1 } }}>

            <Button onClick={() => signIn()}>Sign in</Button>
          </SlideFade>
        </Flex>
      }
      <Spacer />
    </Flex>
  );
};

export default CreateLink;
