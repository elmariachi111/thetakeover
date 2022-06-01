import { Flex, IconButton, Spacer } from "@chakra-ui/react";
import { Payment } from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";
import { default as NextLink } from "next/link";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { ToLogo } from "../../components/atoms/ToLogo";
import { ReportContent } from "../../components/molecules/ReportContent";
import { ViewBundle } from "../../components/molecules/to/ViewBundle";
import { ViewEmbed } from "../../components/molecules/to/ViewEmbed";
import { ViewExternal } from "../../components/molecules/to/ViewExternal";
import { findLink, findLinks } from "../../modules/api/findLink";
import { findSettledPayment } from "../../modules/api/findPayment";
import { extractEmbedUrl } from "../../modules/fixEmbed";
import { XLink } from "../../types/Link";
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

export const getServerSideProps: GetServerSideProps<{
  link: XLink;
  payment: XPayment;
  bundleItems: XLink[];
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

  if (!session || !session.user?.id) {
    return redirectToPayment(linkid);
  }

  const { user } = session;

  let payment: Payment | null;
  if (user.id === link.creatorId) {
    payment = null;
  } else {
    payment = await findSettledPayment(linkid, user.id);

    if (!payment) {
      return redirectToPayment(linkid);
    }
  }

  let bundleItems;
  if (link.bundles.length > 0) {
    const bundleIds = link.bundles.map((b) => b.hash);
    bundleItems = await findLinks(bundleIds);
  } else {
    bundleItems = [];
  }

  return {
    props: {
      link: JSON.parse(JSON.stringify(link)),
      payment: JSON.parse(JSON.stringify(payment)),
      bundleItems: JSON.parse(JSON.stringify(bundleItems)),
    },
  };
};

function ToView({
  link,
  payment,
  bundleItems,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession({
    required: false,
  });
  const [timeout, setTimeout] = useState<number>();
  const [showChrome, setShowChrome] = useState<boolean>(true);

  const motionDetected = useCallback(() => {
    if (timeout) {
      window.clearTimeout(timeout);
    }
    setShowChrome(true);
    setTimeout(
      window.setTimeout(() => {
        setShowChrome(false);
      }, 3000)
    );
  }, [timeout]);

  useEffect(() => {
    window.onscroll = motionDetected;
    return () => {
      window.onscroll = null;
    };
  }, [motionDetected]);
  useEffect(() => {
    motionDetected();
  }, []);

  let view;
  if (bundleItems.length > 0) {
    view = (
      <ViewBundle
        link={link}
        items={bundleItems}
        showChrome={showChrome}
        motionDetected={motionDetected}
      />
    );
  } else {
    if (link.metadata.oembed?.html) {
      view = <ViewEmbed link={link} showChrome={showChrome} />;
    } else {
      view = <ViewExternal link={link} />;
    }
  }

  return (
    <Flex w="100%" h="101vh">
      <Flex
        position="fixed"
        left={2}
        top={0}
        zIndex={20}
        visibility={showChrome ? "visible" : "hidden"}
      >
        <ToLogo />
      </Flex>
      <Flex
        position="fixed"
        right={2}
        top={2}
        visibility={showChrome ? "visible" : "hidden"}
      >
        {session?.user?.id === link.creatorId && (
          <NextLink href={`/to/edit/${link.hash}`} passHref>
            <IconButton aria-label="edit" icon={<FiEdit2 />} />
          </NextLink>
        )}
        {session?.user?.id !== link.creatorId && <ReportContent link={link} />}
      </Flex>
      <Flex margin="0 auto" w="100%" h="100%">
        {view}
      </Flex>
    </Flex>
  );
}

ToView.getLayout = function (page: ReactElement) {
  return <Flex>{page}</Flex>;
};

export default ToView;
