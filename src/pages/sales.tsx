import {
  Box,
  Flex,
  Heading,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { SellerAccount } from "@prisma/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession } from "next-auth/react";
import React from "react";
import { SalesRow } from "../components/molecules/sales/SalesRow";
import { adapterClient } from "../modules/api/adapter";
import { XSalesPayment } from "../types/Payment";

export const getServerSideProps: GetServerSideProps<{
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

  if (!sellerAccount) {
    return {
      redirect: {
        destination: "/my",
      },
      props: {
        payments: [],
      },
    };
  }

  const payments = await adapterClient.payment.findMany({
    where: {
      payee: sellerAccount.merchantIdInPayPal,
      paymentStatus: "COMPLETED",
    },
    include: {
      link: {
        include: {
          metadata: true,
        },
      },
      user: true,
    },
    orderBy: {
      initiatedAt: "desc",
    },
  });

  return {
    props: {
      payments: JSON.parse(JSON.stringify(payments)),
    },
  };
};

const Sales = ({
  payments,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Flex direction="column">
      <Heading my={6}>Sales Overview</Heading>
      <Box overflowX="scroll">
        <Table>
          <Thead>
            <Tr>
              <Th width="10%">time</Th>
              <Th width="50%">link</Th>
              <Th width="20%">user</Th>
              <Th width="10%">price</Th>
              <Th width="10%"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {payments.map((p) => (
              <SalesRow payment={p} key={p.paymentRef} />
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

Sales.auth = true;

export default Sales;
