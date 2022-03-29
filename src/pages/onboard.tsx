import { Flex, Text } from "@chakra-ui/react";
import { MerchantAccount, PrismaClient } from "@prisma/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";
import React from "react";

export const getServerSideProps: GetServerSideProps<{
  merchantAccount: MerchantAccount;
}> = async (context) => {
  const linkid: string = context.params?.linkid as string;
  if (!linkid) return { notFound: true };
  const session = await getSession(context);
  if (!session || !session.user?.id) {
    throw new Error("no user ?!");
  }

  const prisma = new PrismaClient();

  const merchantAccount = prisma.merchantAccount.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  return {
    props: {
      merchantAccount: JSON.parse(JSON.stringify(merchantAccount)),
    },
  };
};

function Onboard({
  merchantAccount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession({
    required: true,
  });

  return (
    <Flex>
      <Text>Onboard</Text>
    </Flex>
  );
}

export default Onboard;
