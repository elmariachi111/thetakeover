import {
  Flex,
  Heading,
  IconButton,
  Link as ChakraLink,
} from "@chakra-ui/react";
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
import { default as NextLink } from "next/link";
import { ReactElement } from "react";
import { FiEdit2 } from "react-icons/fi";
import Iframe from "react-iframe";
import { ToLogo } from "../../components/atoms/ToLogo";
import { findLink } from "../../modules/api/findLink";
import { extractEmbedUrl } from "../../modules/fixEmbed";
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
    return link.originUri;
  }
};

export const getServerSideProps: GetServerSideProps<{
  link: Link & { metadata: Metadata; creator: User };
  payment: XPayment;
  embed: string | null;
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
        linkHash: linkid,
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
      embed: extractEmbedUrl(link.metadata?.embed),
    },
  };
};

function ToView({
  link,
  payment,
  embed,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession({
    required: false,
  });

  if (!embed)
    return (
      <Flex direction="column" w="100%" h="100%">
        <ChakraLink href={link.originUri}>visit</ChakraLink>
      </Flex>
    );

  return (
    <Flex direction="column" w="100%" h="100%">
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
      {session?.user?.id === link.creatorId && (
        <Flex position="absolute" right={2} top={2}>
          <NextLink href={`/to/edit/${link.hash}`} passHref>
            <IconButton aria-label="edit" icon={<FiEdit2 />} />
          </NextLink>
        </Flex>
      )}
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
    </Flex>
  );
}

ToView.getLayout = function (page: ReactElement) {
  return <Flex h="100vh">{page}</Flex>;
};

export default ToView;
