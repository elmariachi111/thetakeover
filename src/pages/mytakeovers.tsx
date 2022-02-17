import { Flex, Heading, Text, Link as ChakraLink } from "@chakra-ui/react";
import { Link } from "@prisma/client";
import axios from "axios";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";


import useSWR, { Fetcher } from "swr";

const MyTakeOvers: NextPage = () => {

  const fetcher: Fetcher<Link[]> = (url) => axios.get<Link[]>(url).then((res) => res.data)
  const { data: links } = useSWR('/api/links/my', fetcher)

  const { data: session } = useSession({
    required: true
  });

  return (
    <Flex  direction="column" h="full" align="center">
      <Heading>My Takeovers</Heading>
      {links?.map(link => (
        <Flex key={link.hash} direction="row">
          
          <ChakraLink isExternal href={`/api/to/${link.hash}`}>
            /api/to/{link.hash}
          </ChakraLink>
          
          <Text>€{link.price}</Text>
        </Flex>
      ))}
    </Flex>
  );
};

export default MyTakeOvers;