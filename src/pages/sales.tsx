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
      link: {
        include: {
          metadata: true,
        },
      },
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
  return (
    <Flex direction="column">
      <Heading my={6}>Sales</Heading>
      <Box overflowX="scroll">
        <Table>
          <Thead>
            <Tr>
              <Th>time</Th>
              <Th>link</Th>
              <Th>user</Th>
              <Th>price</Th>
              <Th></Th>
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
