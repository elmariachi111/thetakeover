import {
  Box,
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { SellerAccount, User } from "@prisma/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession } from "next-auth/react";
import React, { useState } from "react";
import { adapterClient } from "../modules/api/adapter";
import { XLink } from "../types/Link";
import { XPayment } from "../types/Payment";

type XSalesPayment = XPayment & {
  user: User;
  link: XLink;
};

export const getServerSideProps: GetServerSideProps<{
  sellerAccount: SellerAccount | null;
  payments: XSalesPayment[];
}> = async (context) => {
  const session = await getSession(context);

  if (!session?.user?.id) {
    return {
      redirect: {
        permanent: false,
        destination: `/`,
      },
    };
  }

  const sellerAccount = await adapterClient.sellerAccount.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  const payments = await adapterClient.payment.findMany({
    include: {
      link: true,
      user: true,
    },
    where: {
      link: {
        creatorId: session.user.id,
      },
    },
    orderBy: {
      initiatedAt: "desc",
    },
  });

  return {
    props: {
      sellerAccount,
      payments: JSON.parse(JSON.stringify(payments)),
    },
  };
};

const Sales = ({
  sellerAccount,
  payments,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  console.log(payments);
  return (
    <Flex direction="column">
      <Heading my={6}>Sales</Heading>
      <Box overflowX="scroll">
        <Table>
          <Thead>
            <Tr>
              <Th>link</Th>
              <Th>user</Th>
              <Th>ref</Th>
              <Th>price</Th>
              <Th>time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {payments.map((p) => (
              <Tr key={p.paymentRef}>
                <Td>{p.linkHash}</Td>
                <Td>{p.user.id}</Td>
                <Td>{p.paymentRef}</Td>
                <Td>{p.link.price}</Td>
                <Td>{p.initiatedAt}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

Sales.auth = true;

export default Sales;
