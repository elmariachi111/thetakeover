import {
  Button,
  Flex,
  Heading,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react";
import type {
  CreateOrderActions,
  OnApproveActions,
  OnApproveData,
} from "@paypal/paypal-js";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Payment, PaymentStatus, PrismaClient } from "@prisma/client";
import axios from "axios";
import type { InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { MetadataDisplay } from "../../../components/molecules/MetadataDisplay";
import { findLink } from "../../../modules/findLink";

export async function getServerSideProps(context) {
  const linkId = context.params.linkid;
  const prisma = new PrismaClient();

  const link = await findLink(prisma, linkId);
  if (!link) {
    return {
      notFound: true,
    };
  }
  console.log(link);

  const session = await getSession(context);
  if (session && session.user?.id) {
    const payment = await prisma.payment.findFirst({
      where: {
        link_hash: linkId,
        userId: session.user.id,
      },
    });
    console.log("payment", session, payment);
    if (payment && payment.paymentStatus === PaymentStatus.COMPLETED) {
      return {
        redirect: {
          destination: `/to/${linkId}`,
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      link: JSON.parse(JSON.stringify(link)),
    },
  };
}

function ToPay({
  link,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession({
    required: true,
  });
  const router = useRouter();
  const { linkid } = router.query;
  console.log(link);

  const [payment, setPayment] = useState<Payment>();

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
            value: link.price,
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
          <Text fontSize="md">
            <b>{link.hash}</b> by {link.creator.name}
          </Text>
        </Flex>

        <Flex>
          <Text fontSize="4xl" fontWeight="bold">
            €{link.price}
          </Text>
        </Flex>
      </Flex>
      {link.metadata && <MetadataDisplay metadata={link.metadata} image />}
      {payment ? (
        <Button as={ChakraLink} href={`/to/${payment.link_hash}`}>
          download
        </Button>
      ) : (
        <Flex direction="column" w="full" mt={6}>
          <PayPalButtons createOrder={createOrder} onApprove={onApprove} />
        </Flex>
      )}
    </Flex>
  );
}

export default ToPay;
