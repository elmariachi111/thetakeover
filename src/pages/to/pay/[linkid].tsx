import {
  Button,
  Flex,
  Heading,
  Image,
  Link as ChakraLink,
  Text,
  useToast,
} from "@chakra-ui/react";
import type {
  CreateOrderActions,
  OnApproveActions,
  OnApproveData,
} from "@paypal/paypal-js";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  Payment,
  PaymentStatus,
  PrismaClient,
  SellerAccount,
} from "@prisma/client";
import axios from "axios";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import { GeneralAlert } from "../../../components/atoms/GeneralAlert";
import { ReportContent } from "../../../components/molecules/ReportContent";
import { SellerNotConnectedAlert } from "../../../components/molecules/SellerNotConnectedAlert";
import { findLink } from "../../../modules/api/findLink";
import { DisplayableLink } from "../../../types/Link";

export const getServerSideProps: GetServerSideProps<{
  link: DisplayableLink;
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

  const session = await getSession(context);
  if (session && session.user?.id) {
    const payment = await prisma.payment.findFirst({
      where: {
        linkHash: linkid,
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
  const { status: sessionStatus, data: sessionData } = useSession();
  const toast = useToast();

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
          description: `Takeover ${linkid} by ${link.creator.name}`,
          amount: {
            currency_code: "EUR",
            value: `${link.price}`,
          },

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
    try {
      await axios.post(`/api/to/pay/${orderId}`);
    } catch (e: any) {
      toast({
        status: "warning",
        title: "Payment failed. Nothing has been charged",
        description: `Reason: ${e.message}`,
      });
      throw e;
    }
    //console.log(orderId);
    return orderId;
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) return;
    try {
      const details = await actions.order.capture();
      const res = await axios.post(`/api/to/pay/${details.id}`);
      setPayment(await res.data);
    } catch (e: any) {
      toast({
        title: "Payment failed. Nothing has been charged",
        description: `Reason: ${e.message}`,
      });
    }
  };

  const isCreator = useMemo(() => {
    return (
      sessionStatus === "authenticated" &&
      link.creatorId === sessionData?.user?.id
    );
  }, [sessionStatus, sessionData, link]);

  return (
    <Flex direction="column">
      <Flex my={5} direction="row" justify="space-between">
        <Flex direction="column">
          <Heading size="lg" color="gray.500">
            {link.creator.name}
          </Heading>
          <Heading size="md">{link.metadata.title}</Heading>
        </Flex>
        <ReportContent link={link} />
      </Flex>
      <Image
        src={link.metadata.previewImage}
        mt={2}
        width="100%"
        alt={link.metadata.title}
      />
      <Text my={5} fontSize="sm">
        {link.metadata.description}
      </Text>
      {link.saleStatus === "ON_SALE" ? (
        <>
          <Flex direction="row" my={6} justify="space-between">
            <Text fontWeight={500} fontSize="lg">
              Total
            </Text>
            <Text fontWeight={700} fontSize="xl">
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
                <Button as={ChakraLink} href={`/to/${payment.linkHash}`}>
                  proceed to content
                </Button>
              ) : (
                <Flex direction="column" w="full" mt={6}>
                  <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    style={{ shape: "rect" }}
                  />
                </Flex>
              )}
            </PayPalScriptProvider>
          ) : (
            <SellerNotConnectedAlert creator={link.creator} />
          )}
        </>
      ) : (
        <GeneralAlert
          status="info"
          title="This item is currently not for sale."
        />
      )}

      {isCreator && (
        <Button as={ChakraLink} href={`/to/${link.hash}`} mt={6}>
          proceed to content
        </Button>
      )}
    </Flex>
  );
}

export default ToPay;
