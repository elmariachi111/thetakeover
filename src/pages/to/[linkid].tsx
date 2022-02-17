import { Flex, Heading, Text } from "@chakra-ui/react";
import { Link } from "@prisma/client";
import axios from "axios";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import useSWR, { Fetcher } from "swr";
import { useRouter } from 'next/router'

const IncomingLink: NextPage = () => {
  const router = useRouter()
  const { linkid } = router.query

  const fetcher: Fetcher<Link[]> = (url) => axios.get<Link[]>(url).then((res) => res.data)
  //const { data: links } = useSWR('/api/links/my', fetcher)

  const { data: session } = useSession({
    required: true
  });

  return (
    <Flex  direction="column" h="full" align="center">
      <Text>Displays admin content for: {linkid}</Text>    
    </Flex>
  );
};

export default IncomingLink;