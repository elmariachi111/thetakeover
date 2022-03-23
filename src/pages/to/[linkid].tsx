import { Flex, Heading, Link as ChakraLink } from "@chakra-ui/react";
import {
  Link,
  Metadata,
  Payment,
  PaymentStatus,
  PrismaClient,
  User,
} from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";
import { ReactElement, useEffect, useState } from "react";
import Iframe from "react-iframe";
import { ToLogo } from "../../components/atoms/ToLogo";
import { findLink } from "../../modules/findLink";
import { fixEmbed } from "../../modules/fixEmbed";
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
  link: Link & { metadata: Metadata; creator: User };
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
  const [embed, setEmbed] = useState<string | null>();
  useEffect(() => {
    setEmbed(fixEmbed(link.metadata.embed));
  }, [link.metadata.embed]);

  return (
    <Flex direction="column" w="100%" h="100%">
      {embed ? (
        <>
          <Flex w="100%" h="100%">
            <Iframe
              url={embed}
              allowFullScreen
              width="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </Flex>
          <Flex position="absolute" left={12} top={12}>
            <ToLogo />
          </Flex>
          <Flex
            position="absolute"
            bottom={10}
            alignSelf="center"
            alignItems="center"
            direction="column"
          >
            <Heading size="md" color="white">
              {link.creator.name}
            </Heading>
            <Heading size="md" color="white" my={2} textAlign="center">
              {link.metadata.title}
            </Heading>
          </Flex>
        </>
      ) : (
        <ChakraLink href={link.origin_uri}>visit</ChakraLink>
      )}
    </Flex>
  );
}

ToView.getLayout = function (page: ReactElement) {
  return <Flex h="100vh">{page}</Flex>;
};

export default ToView;
