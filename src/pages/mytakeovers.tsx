import { Flex, Text } from "@chakra-ui/react";
import { Link } from "@prisma/client";
import axios from "axios";
import type { NextPage } from "next";
import useSWR, { Fetcher } from "swr";

const MyTakeOvers: NextPage = () => {

  const fetcher: Fetcher<Link[]> = (url) => axios.get<Link[]>(url).then((res) => res.data)
  const { data: links } = useSWR('/api/links/my', fetcher)


  return (
    <Flex  direction="column" h="full" align="center">
      {links?.map(link => (
        <Flex key={link.hash} direction="row">
          <Text >{link.hash}</Text>
          <Text>€{link.price}</Text>
        </Flex>
      ))}
    </Flex>
  );
};

export default MyTakeOvers;