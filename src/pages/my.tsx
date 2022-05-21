import {
  Collapse,
  Flex,
  Heading,
  Link as ChakraLink,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { PrismaClient } from "@prisma/client";
import type { InferGetServerSidePropsType } from "next";
import { getSession } from "next-auth/react";
import React, { useEffect } from "react";
import { SellerAccountDialog } from "../components/molecules/SellerAccountDialog";
import { TakeoverCard } from "../components/molecules/TakeoverCard";
import { MyPaymentsView } from "../components/organisms/MyPaymentsView";

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

  const sellerAccount = await prisma.sellerAccount.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  const links = await prisma.link.findMany({
    where: {
      creatorId: session.user.id,
    },
    select: {
      _count: {
        select: { payments: true },
      },
      hash: true,
      price: true,
      originUri: true,
      saleStatus: true,
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
      sellerAccount: JSON.parse(JSON.stringify(sellerAccount)),
    },
  };
}

function MyTakeOvers({
  links,
  payments,
  sellerAccount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { isOpen, onClose } = useDisclosure({
    defaultIsOpen: true,
  });

  useEffect(() => {
    if (sellerAccount) {
      setTimeout(onClose, 4000);
    }
  }, [sellerAccount, onClose]);

  return (
    <Flex direction="column" h="full" align="flex-start">
      {links.length > 0 && (
        <Flex w="100%">
          <Collapse in={isOpen} style={{ width: "100%" }}>
            <SellerAccountDialog
              sellerAccount={sellerAccount}
              onClose={onClose}
            />
          </Collapse>
        </Flex>
      )}
      <Heading fontSize="xl" my={5}>
        Your Takeovers
      </Heading>

      <VStack gap={3} align="left" w="full">
        {links?.map((link) => (
          <TakeoverCard link={link} key={link.hash} />
        ))}
      </VStack>

      <MyPaymentsView payments={payments} />
    </Flex>
  );
}

export default MyTakeOvers;

MyTakeOvers.auth = true;
