import {
  Button,
  Flex,
  Heading,
  Link as ChakraLink,
  SkeletonCircle,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import type {
  CreateOrderActions,
  OnApproveActions,
  OnApproveData,
} from "@paypal/paypal-js";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Payment } from "@prisma/client";
import axios from "axios";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR, { Fetcher } from "swr";

import { MetadataDisplay } from "../../../components/molecules/MetadataDisplay";

const ToPay: NextPage = () => {
  const router = useRouter();
  const { linkid } = router.query;

  const { data: session } = useSession({
    required: true,
  });

  const [payment, setPayment] = useState<Payment>();
  const fetcher: Fetcher<any> = (url) => axios.get(url).then((res) => res.data);
  const { data } = useSWR(`/api/links/${linkid}`, fetcher);

  const createOrder = async (
    _data: Record<string, unknown>,
    actions: CreateOrderActions
  ) => {
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
    const res = await axios.post(`/api/to/pay/${orderId}`);

    console.log(orderId);
    return orderId;
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) return;
    const details = await actions.order.capture();
    console.log(actions, details);
    const res = await axios.post(`/api/to/pay/${details.id}`);
    setPayment(await res.data);
  };

  return (
    <Flex direction="column" align="center">
      <Flex
        direction="row"
        justifyContent="space-between"
        align="center"
        w="full"
      >
        <Flex direction="column" my={5}>
          <Heading textTransform="uppercase">Pay</Heading>
          <SkeletonText isLoaded={data?.link}>
            <Text fontSize="md">
              <b>{data?.link.hash}</b> by {data?.link.creator.name}
            </Text>
          </SkeletonText>
        </Flex>

        <Flex>
          {data?.link.price ? (
            <Text fontSize="4xl" fontWeight="bold">
              €{data?.link.price}
            </Text>
          ) : (
            <SkeletonCircle />
          )}
        </Flex>
      </Flex>
      {data?.link.metadata && (
        <MetadataDisplay metadata={data?.link.metadata} image />
      )}
      {data && !payment && (
        <Flex direction="column" w="full" mt={6}>
          <PayPalButtons createOrder={createOrder} onApprove={onApprove} />
        </Flex>
      )}

      {payment && (
        <Button as={ChakraLink} href={`/to/${payment.link_hash}`}>
          download
        </Button>
      )}
    </Flex>
  );
};

export default ToPay;
