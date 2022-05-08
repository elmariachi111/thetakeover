import {
  Button,
  Flex,
  Heading,
  IconButton,
  Image,
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

// const viewLink = (link: Link & { metadata: Metadata | null }) => {
//   if (link.metadata) {
//     return `/to/${link.hash}`;
//   } else {
//     return link.originUri;
//   }
// };

type XLink = Link & { metadata: Metadata; creator: User };

export const getServerSideProps: GetServerSideProps<{
  link: XLink;
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

const TitleAndCreator = (props: { link: XLink; color?: string }) => {
  const { link, color } = props;
  return (
    <Flex direction="column" align="center">
      <Heading size="lg" color={color}>
        {link.creator.name}
      </Heading>
      <Heading size="md" color={color}>
        {link.metadata.title}
      </Heading>
    </Flex>
  );
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
      <Flex
        direction="column"
        h="100vh"
        w="container.lg"
        justify="center"
        margin="0 auto"
        gridGap={6}
        px={[2, 2, null]}
      >
        <TitleAndCreator link={link} />
        {link.metadata.previewImage && (
          <Image src={link.metadata.previewImage} />
        )}
        <Button as={ChakraLink} href={link.originUri}>
          proceed to content
        </Button>
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
        bottom={5}
        alignSelf="center"
        alignItems="center"
        direction="column"
      >
        <TitleAndCreator link={link} color="white" />
      </Flex>
    </Flex>
  );
}

ToView.getLayout = function (page: ReactElement) {
  return <Flex h="100vh">{page}</Flex>;
};

export default ToView;
