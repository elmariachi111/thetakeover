import { Button, Flex, Heading, Link as ChakraLink, Skeleton, Text } from "@chakra-ui/react";
import { Link, Payment } from "@prisma/client";
import axios from "axios";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import useSWR, { Fetcher } from "swr";
import { useRouter } from 'next/router'
import { useState } from "react";

const ToPay: NextPage = () => {
  const router = useRouter()
  const { linkid } = router.query
  
  const { data: session } = useSession({
    required: true
  });

  const [payment, setPayment] = useState<Payment>()
  const fetcher: Fetcher<any> = (url) => axios.get(url).then((res) => res.data)
  const { data } = useSWR(`/api/links/${linkid}`, fetcher)

  const pay = async(linkId: string) => {
    const res = await axios.post(`/api/to/pay/${data.link.hash}`)
    setPayment(await res.data);
  }

  return (
    <Flex  direction="column" h="full" align="center">
      <Heading>Pay</Heading>
      <Skeleton isLoaded={!!data}>
        {data && <>
          <Text>LID: {data.link.hash}</Text>
          <Text>by {data.link.creator.name}</Text>
          <Button onClick={() => pay(data.link.hash)} disabled={!session?.user}>pay €{data.link.price}</Button>
        </>
        }
      </Skeleton>
      {payment && <Button as={ChakraLink} href={`/api/to/${payment.link_hash}`}>download</Button>}
    </Flex>
  );
};

export default ToPay;