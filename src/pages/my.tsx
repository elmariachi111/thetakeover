import {
  Button,
  Flex,
  Heading,
  Link,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import type { InferGetServerSidePropsType } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { default as NextLink } from "next/link";
import { useState } from "react";
import { TakeoverCard } from "../components/molecules/TakeoverCard";
import { ToSuccessOverlay } from "../components/molecules/ToSuccessOverlay";
import { BundleCreator } from "../components/organisms/BundleCreator";
import { MyPaymentsView } from "../components/organisms/MyPaymentsView";
import { ToCardLink } from "../types/Link";

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();

  const session = await getSession(context);

  if (!session || !session.user?.id) {
    return {
      redirect: {
        destination: `/api/auth/signin?callbackUrl=/my`,
        permanent: false,
      },
    };
  }

  const links = await prisma.link.findMany({
    where: {
      creatorId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      _count: {
        select: { payments: true },
      },
      hash: true,
      price: true,
      originUri: true,
      saleStatus: true,
      createdAt: true,
      bundles: {
        select: {
          hash: true,
          metadata: {
            select: {
              title: true,
              previewImage: true,
            },
          },
        },
      },
      metadata: {
        select: {
          title: true,
          previewImage: true,
        },
      },
    },
  });

  const payments = await prisma.payment.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      link: {
        select: {
          hash: true,
          metadata: {
            select: {
              title: true,
              previewImage: true,
            },
          },
        },
      },
    },
  });
  return {
    props: {
      links: JSON.parse(JSON.stringify(links)),
      payments: JSON.parse(JSON.stringify(payments)),
    },
  };
}

function MyTakeOvers({
  links,
  payments,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [items, setItems] = useState<ToCardLink[]>(links);
  const [selected, setSelected] = useState<string[]>([]);
  const [createBundle, setCreateBundle] = useState<boolean>(false);
  const [newBundleUrl, setNewBundleUrl] = useState<string>();

  const removeTakeover = async (hash) => {
    await axios.delete(`/api/to/${hash}`);
    setItems((old) => old.filter((l) => l.hash !== hash));
  };

  const toggleInBundle = (hash: string) => {
    if (selected.includes(hash)) {
      setSelected((old) => old.filter((s) => s !== hash));
    } else {
      setSelected((old) => [...old, hash]);
    }
  };

  return (
    <Flex direction="column" h="full" align="flex-start">
      <Head>
        <title>Your Takeovers</title>
      </Head>
      <Flex justify="space-between" align="center" width="100%">
        <Heading my={5}>Your Takeovers</Heading>
        <Spacer />

        {selected.length > 1 ? (
          <Button size="xs" onClick={() => setCreateBundle(!createBundle)}>
            {createBundle ? "cancel" : "create a bundle"}
          </Button>
        ) : (
          <NextLink href="/profile" passHref>
            <Link>your profile</Link>
          </NextLink>
        )}
      </Flex>

      {createBundle && (
        <Flex mt={6} mb={12} w="100%">
          <BundleCreator
            onCreated={(url: string) => {
              setSelected([]);
              setNewBundleUrl(url);
              setCreateBundle(false);
            }}
            onCancel={() => {
              setCreateBundle(false);
              setSelected([]);
            }}
            items={items.filter((l) => selected.includes(l.hash))}
          />
        </Flex>
      )}
      {newBundleUrl && (
        <ToSuccessOverlay
          title="Your Takeover is ready"
          createdLink={newBundleUrl}
          onClose={() => {
            setNewBundleUrl(undefined);
          }}
        />
      )}
      <VStack align="left" w="full">
        {items
          .filter((l) => (createBundle ? selected.includes(l.hash) : true))
          .map((link) => (
            <TakeoverCard
              link={link}
              key={link.hash}
              isSelected={selected.includes(link.hash)}
              onSelect={toggleInBundle}
              onRemove={removeTakeover}
            />
          ))}
      </VStack>
      {items.length == 0 && (
        <Flex direction="column" width="full" gap={6} align="center" mt={12}>
          <Text>
            You haven&apos;t created a Takeover yet. Now it&apos;s a good time
            to try it:
          </Text>
          <NextLink href="/create" passHref>
            <Button as={Link} to="/create" width="75%">
              Create your first Takeover...
            </Button>
          </NextLink>
        </Flex>
      )}
      <MyPaymentsView payments={payments} />
    </Flex>
  );
}

export default MyTakeOvers;

MyTakeOvers.auth = true;
