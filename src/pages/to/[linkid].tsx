import { Flex } from "@chakra-ui/react";
import {
  Link,
  Metadata,
  Payment,
  PaymentStatus,
  PrismaClient,
} from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";
import { MetadataDisplay } from "../../components/molecules/MetadataDisplay";
import { PaymentDisplay } from "../../components/molecules/PaymentDisplay";
import { findLink } from "../../modules/findLink";
import { XPayment } from "../../types/Payment";

const redirectToPayment = (linkId: string) => {
  return {
    redirect: {
      destination: `/to/pay/${linkId}`,
      permanent: false,
    },
  };
};

const viewLink = (link: Link & { metadata: Metadata | null }) => {
  if (link.metadata) {
    return `/to/${link.hash}`;
  } else {
    return link.origin_uri;
  }
};

export const getServerSideProps: GetServerSideProps<{
  link: Link & { metadata: Metadata };
  payment: XPayment;
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
  console.log("USer", session?.user);
  if (!session || !session.user?.id) {
    return redirectToPayment(linkid);
  }

  const { user } = session;

  let payment: Payment | null;
  if (user.id === link.creatorId) {
    payment = null;
  } else {
    payment = await prisma.payment.findFirst({
      where: {
        link_hash: linkid,
        userId: user.id,
      },
    });
    if (!payment || payment.paymentStatus !== PaymentStatus.COMPLETED) {
      return redirectToPayment(linkid);
    }
  }

  return {
    props: {
      link: JSON.parse(JSON.stringify(link)),
      payment: JSON.parse(JSON.stringify(payment)),
    },
  };
};

function ToView({
  link,
  payment,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession({
    required: true,
  });

  return (
    <Flex direction="column" align="center">
      <MetadataDisplay metadata={link.metadata} />
      <Flex w="full" my={6}>
        <div dangerouslySetInnerHTML={{ __html: link.metadata.embed! }} />
      </Flex>
      {payment && <PaymentDisplay payment={payment} />}
    </Flex>
  );
}

export default ToView;
