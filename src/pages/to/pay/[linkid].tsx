import { Button, Flex, Heading, Link as ChakraLink, Skeleton, Spacer, Text } from "@chakra-ui/react";
import { Link, Payment } from "@prisma/client";
import axios from "axios";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import useSWR, { Fetcher } from "swr";
import { useRouter } from 'next/router'
import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import type { CreateOrderActions, OnApproveData, OnApproveActions } from "@paypal/paypal-js";

const ToPay: NextPage = () => {
  const router = useRouter()
  const { linkid } = router.query

  const { data: session } = useSession({
    required: true
  });

  const [payment, setPayment] = useState<Payment>()
  const fetcher: Fetcher<any> = (url) => axios.get(url).then((res) => res.data)
  const { data } = useSWR(`/api/links/${linkid}`, fetcher)

  const createOrder = async (_data: Record<string, unknown>, actions: CreateOrderActions) => {
    const orderId = await actions.order.create({
      purchase_units: [
        {
          reference_id: linkid as string,
          description: `TO ${linkid}`,
          amount: {
            currency_code: "EUR",
            value: data.link.price,
          },
          // payment_instruction: {
          //   disbursement_mode: "INSTANT",
          //   platform_fees: [
          //     {
          //       amount: {
          //         currency_code: "EUR",
          //         value: (0.1 * data.link.price).toFixed(2)
          //       }
          //     }
          //   ]
          // }
        },
      ],
    });
    const res = await axios.post(`/api/to/pay/${orderId}`)

    console.log(orderId);
    return orderId
  }

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) return;
    const details = await actions.order.capture();
    console.log(actions, details);
    const res = await axios.post(`/api/to/pay/${details.id}`)
    setPayment(await res.data);
  }

  return (
    <Flex direction="column" align="center" >
      <Flex direction="row" justifyContent="space-between" align="center" w="full">
        <Flex direction="column" my={5}>
          <Heading textTransform="uppercase" >Pay</Heading>
          <Text fontSize="md">
            <b>{data.link.hash}</b>{' '}
            by {data.link.creator.name}
          </Text>
        </Flex>
        <Flex>
          <Text fontSize="4xl" fontWeight="bold">€{data.link.price}</Text>
        </Flex>
      </Flex>
      {
        data && !payment && <Flex direction="column" w="full">
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
          />

        </Flex>
      }

      {payment && <Button as={ChakraLink} href={`/api/to/${payment.link_hash}`}>download</Button>}
    </Flex >
  );
};

export default ToPay;