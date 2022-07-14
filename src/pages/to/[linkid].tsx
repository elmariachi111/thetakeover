import { Flex, IconButton, useToast } from "@chakra-ui/react";
import axios from "axios";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";
import { default as NextLink } from "next/link";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { FiEdit2, FiTrash } from "react-icons/fi";
import { ToLogo } from "../../components/atoms/ToLogo";
import { ReportContent } from "../../components/molecules/ReportContent";
import { ViewBundle } from "../../components/molecules/to/ViewBundle";
import { ViewLink } from "../../components/molecules/to/ViewLink";
import { GateWorkerProvider } from "../../context/GatingWorkerContext";
import { findLink, findLinks } from "../../modules/api/findLink";
import { countPayments } from "../../modules/api/findPayment";
import * as Gate from "../../modules/gate";
import { XLink } from "../../types/Link";

const redirectToPayment = (linkId: string) => {
  return {
    redirect: {
      destination: `/to/pay/${linkId}`,
      permanent: false,
    },
  };
};

export const getServerSideProps: GetServerSideProps<{
  link: XLink;
  bundleItems: XLink[];
  paymentCount: number;
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

  const canAccessContent = await Gate.canAccessLink(user, link);
  if (!canAccessContent) {
    return redirectToPayment(link.hash);
  }

  console.info(`[VIEW] ${user?.id || "-"} ${link.creatorId} ${linkid}`);

  const paymentCount = await countPayments(link.hash);

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
      bundleItems: JSON.parse(JSON.stringify(bundleItems)),
      paymentCount,
    },
  };
};

function ToView({
  link,
  bundleItems,
  paymentCount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession({
    required: false,
  });
  const [timeout, setTimeout] = useState<number>();
  const [showChrome, setShowChrome] = useState<boolean>(true);

  const toast = useToast();

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

  const removeTakeover = async () => {
    await axios.delete(`/api/to/${link.hash}`);
    toast({
      title: `${link.metadata.title} has been deleted.`,
    });
  };

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
    view = ViewLink({ link, showChrome });
  }

  return (
    <Flex w="100vw">
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
        zIndex={20}
        visibility={showChrome ? "visible" : "hidden"}
      >
        {session?.user?.id === link.creatorId && (
          <>
            <NextLink href={`/to/edit/${link.hash}`} passHref>
              <IconButton aria-label="edit" icon={<FiEdit2 />} />
            </NextLink>
            {paymentCount === 0 && (
              <IconButton
                aria-label="delete"
                icon={<FiTrash />}
                onClick={removeTakeover}
              />
            )}
          </>
        )}
        {session?.user?.id !== link.creatorId && <ReportContent link={link} />}
      </Flex>
      <GateWorkerProvider>
        <Flex
          margin="0 auto"
          borderBottom={bundleItems.length == 0 ? "1px solid black" : ""}
          w="100%"
        >
          {view}
        </Flex>
      </GateWorkerProvider>
    </Flex>
  );
}

ToView.getLayout = function (page: ReactElement) {
  return <Flex>{page}</Flex>;
};

export default ToView;
