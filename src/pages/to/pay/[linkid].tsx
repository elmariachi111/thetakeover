import {
  Button,
  Flex,
  Heading,
  Image,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react";
import type {
  CreateOrderActions,
  OnApproveActions,
  OnApproveData,
} from "@paypal/paypal-js";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  Link,
  Metadata,
  Payment,
  PaymentStatus,
  PrismaClient,
  SellerAccount,
  User,
} from "@prisma/client";
import axios from "axios";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { SellerNotConnectedAlert } from "../../../components/molecules/SellerNotConnectedAlert";
import { findLink } from "../../../modules/findLink";

export const getServerSideProps: GetServerSideProps<{
  link: Link & { metadata: Metadata; creator: User; price: number };
  seller: SellerAccount;
}> = async (context) => {
  const linkid: string = context.params?.linkid as string;
  if (!linkid) return { notFound: true };

  const prisma = new PrismaClient();

  const link = await findLink(prisma, linkid);
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
        link_hash: linkid,
        userId: session.user.id,
      },
    });
    //console.log("payment", session, payment);
    if (payment && payment.paymentStatus === PaymentStatus.COMPLETED) {
      return {
        redirect: {
          destination: `/to/${linkid}`,
          permanent: false,
        },
      };
    }
  }
  const seller = await prisma.sellerAccount.findFirst({
    where: {
      userId: link.creatorId,
    },
  });

  return {
    props: {
      link: JSON.parse(JSON.stringify(link)),
      seller: JSON.parse(JSON.stringify(seller)),
    },
  };
};

function ToPay({
  link,
  seller,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { linkid } = router.query;
  //console.log(link);

  const [payment, setPayment] = useState<Payment>();

  const createOrder = async (
    _data: Record<string, unknown>,
    actions: CreateOrderActions
  ) => {
    const orderId = await actions.order.create({
      intent: "CAPTURE",
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
      purchase_units: [
        {
          reference_id: linkid as string,
          description: `TO ${linkid}`,
          amount: {
            currency_code: "EUR",
            value: `${link.price}`,
          },
          // items: [
          //   {
          //     name: `Takeover ${linkid} by ${link.creator.name}`,
          //     quantity: "1",
          //     unit_amount: {
          //       currency_code: "EUR",
          //       value: `${link.price}`,
          //     },
          //     category: "DIGITAL_GOODS",
          //   },
          // ],

          /*
           * consider adding payee information (needs their email address)
           * https://developer.paypal.com/api/orders/v2/#definition-purchase_unit_request
           */
          payment_instruction: {
            disbursement_mode: "INSTANT",
            platform_fees: [
              {
                amount: {
                  currency_code: "EUR",
                  value: (0.1 * link.price).toFixed(2),
                },
              },
            ],
          },
        },
      ],
    });
    const res = await axios.post(`/api/to/pay/${orderId}`);

    //console.log(orderId);
    return orderId;
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) return;
    const details = await actions.order.capture();
    //console.log(actions, details);
    const res = await axios.post(`/api/to/pay/${details.id}`);

    const signinResult = await signIn("email", {
      email: details.payer.email_address,
      redirect: false,
    });
    setPayment(await res.data);
  };

  return (
    <Flex direction="column">
      <Flex my={6} direction="column">
        <Heading size="md" color="brand.300">
          {link.creator.name}
        </Heading>
        <Heading size="md">{link.metadata.title}</Heading>
      </Flex>
      <Image src={link.metadata.previewImage} mt={2} />
      <Text>{link.metadata.description}</Text>
      <Flex direction="row" my={6} justify="space-between">
        <Text fontWeight="bold" fontSize="lg">
          Total
        </Text>
        <Text fontWeight="bold" fontSize="lg">
          €{link.price}
        </Text>
      </Flex>
      {seller ? (
        <PayPalScriptProvider
          options={{
            "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
            "merchant-id": seller.merchantIdInPayPal,
            currency: "EUR",
          }}
        >
          {payment ? (
            <Button as={ChakraLink} href={`/to/${payment.link_hash}`}>
              proceed to content
            </Button>
          ) : (
            <Flex direction="column" w="full" mt={6}>
              <PayPalButtons createOrder={createOrder} onApprove={onApprove} />
            </Flex>
          )}
        </PayPalScriptProvider>
      ) : (
        <SellerNotConnectedAlert creator={link.creator} />
      )}
    </Flex>
  );
}

export default ToPay;
