import { Flex, Heading, Text, Link as ChakraLink, Table, Tr, Td, Thead, Th } from "@chakra-ui/react";
import { Link } from "@prisma/client";
import axios from "axios";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";


import useSWR, { Fetcher } from "swr";

const MyTakeOvers: NextPage = () => {

  const fetcher: Fetcher<Link[]> = (url) => axios.get<Link[]>(url).then((res) => res.data)
  const { data: links } = useSWR('/api/links/my', fetcher)

  console.log(links)
  const { data: session } = useSession({
    required: true
  });

  return (
    <Flex direction="column" h="full" align="flex-start">
      <Heading fontSize="xl" textTransform="uppercase" my={5}>Your Takeovers</Heading>
      <Table>
        <Thead>
          <Tr>
            <Th>Link</Th>
            <Th isNumeric>Price</Th>
            <Th isNumeric>Downloads</Th>
          </Tr>
        </Thead>
        {links?.map(link => (
          <Tr key={link.hash}>
            <Td>
              <Flex direction="column">
                <ChakraLink isExternal href={`/api/to/${link.hash}`}>
                  {link.hash}
                </ChakraLink>
                <Text fontSize="xs">
                  {link.origin_uri}
                </Text>
              </Flex>
            </Td>
            <Td isNumeric>
              <Text>€{link.price}</Text>
            </Td>
            <Td isNumeric>
              {link._count.payments}
            </Td>
          </Tr>
        ))}
      </Table>
    </Flex>
  );
};

export default MyTakeOvers;