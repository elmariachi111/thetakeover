import {
  AspectRatio,
  Button,
  Flex,
  Heading,
  Image,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { SellerAccount } from "@prisma/client";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { ReportContent } from "../../../components/molecules/ReportContent";
import { SellerNotConnectedAlert } from "../../../components/molecules/SellerNotConnectedAlert";
import { adapterClient } from "../../../modules/api/adapter";
import { findLink } from "../../../modules/api/findLink";
import { findSettledPayment } from "../../../modules/api/findPayment";
import { DisplayableLink } from "../../../types/Link";

import { SocialMediaMetadata } from "../../../components/atoms/SocialMediaMetadata";
import { ConditionAllowanceDialog } from "../../../components/organisms/Gate/ConditionAllowanceDialog";
import logtail from "../../../modules/api/logging";
import { usePaypalActions } from "../../../modules/usePaypalActions";

export const getServerSideProps: GetServerSideProps<{
  link: DisplayableLink;
  seller: SellerAccount | null;
}> = async (context) => {
  const linkid: string = context.params?.linkid as string;
  if (!linkid) return { notFound: true };
  const link = await findLink(linkid);
  if (!link) {
    return {
      notFound: true,
    };
  }

  const session = await getSession(context);
  if (session && session.user?.id) {
    const payment = await findSettledPayment(linkid, session.user.id);

    if (payment) {
      return {
        redirect: {
          destination: `/to/${linkid}`,
          permanent: false,
        },
      };
    }
  }

  logtail.info("takeover:pay", {
    user: session?.user?.id || "-",
    creator: link.creatorId,
    link: linkid,
  });

  const seller = await adapterClient.sellerAccount.findFirst({
    where: {
      userId: link.creatorId,
      isActive: true,
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
  const { status: sessionStatus, data: sessionData } = useSession();
  const { payment, onApprove, createOrder } = usePaypalActions(link);

  const isCreator = useMemo(() => {
    return (
      sessionStatus === "authenticated" &&
      link.creatorId === sessionData?.user?.id
    );
  }, [sessionStatus, sessionData, link]);

  return (
    <Flex direction="column">
      <SocialMediaMetadata link={link} />
      <Flex my={5} direction="row" justify="space-between">
        <Flex direction="column">
          <Heading size="lg" color="gray.500">
            {link.creator.name}
          </Heading>
          <Heading size="md">{link.metadata.title}</Heading>
        </Flex>
        {!isCreator && <ReportContent link={link} size="xs" variant="ghost" />}
      </Flex>

      <AspectRatio ratio={16 / 9} overflow="hidden" my={4}>
        <Image
          src={link.metadata.previewImage}
          width="100%"
          alt={link.metadata.title}
        />
      </AspectRatio>
      <Flex direction="column">
        <ReactMarkdown
          components={ChakraUIRenderer()}
          // eslint-disable-next-line react/no-children-prop
          children={link.metadata.description}
          skipHtml
        />
      </Flex>

      {(payment || isCreator) && (
        <Button as={ChakraLink} href={`/to/${link.hash}`} my={6}>
          proceed to content
        </Button>
      )}
      {link.chainConditions && <ConditionAllowanceDialog link={link} />}

      {!payment && link.saleStatus === "ON_SALE" && (
        <>
          {seller ? (
            <PayPalScriptProvider
              options={{
                "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
                "data-partner-attribution-id": process.env
                  .NEXT_PUBLIC_PAYPAL_ATTRIBUTION_ID as string,
                "merchant-id": seller.merchantIdInPayPal,
                currency: "EUR",
              }}
            >
              <Flex direction="row" my={6} justify="space-between">
                <Text fontWeight={500} fontSize="lg">
                  Total
                </Text>
                <Text fontWeight={700} fontSize="xl">
                  €{link.price}
                </Text>
              </Flex>
              <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                style={{
                  shape: "rect",
                  label: "pay",
                }}
              />
            </PayPalScriptProvider>
          ) : (
            <SellerNotConnectedAlert creator={link.creator} />
          )}
        </>
      )}
    </Flex>
  );
}

export default ToPay;
