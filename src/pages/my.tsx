import {
  Flex,
  Heading,
  Link as ChakraLink,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { PrismaClient } from "@prisma/client";
import type { InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();

  const session = await getSession(context);

  if (!session || !session.user?.id) {
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=/my`,
        permanent: false,
      },
    };
  }

  const links = await prisma.link.findMany({
    where: {
      creatorId: session.user.id,
    },
    include: {
      _count: {
        select: { payments: true },
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
  const { data: session } = useSession({
    required: true,
  });

  console.log(payments);

  return (
    <Flex direction="column" h="full" align="flex-start">
      <Heading fontSize="xl" my={5}>
        Your Takeovers
      </Heading>
      <Table>
        <Thead>
          <Tr>
            <Th>Link</Th>
            <Th isNumeric>Price</Th>
            <Th isNumeric>Downloads</Th>
          </Tr>
        </Thead>
        <Tbody>
          {links?.map((link) => (
            <Tr key={link.hash}>
              <Td>
                <Flex direction="column">
                  <ChakraLink isExternal href={`/to/${link.hash}`}>
                    {link.hash}
                  </ChakraLink>
                  <Text fontSize="xs">{link.origin_uri}</Text>
                </Flex>
              </Td>
              <Td isNumeric>
                <Text>€{link.price}</Text>
              </Td>
              <Td isNumeric>{link._count.payments}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading fontSize="xl" mt={12} mb={6}>
        Downloaded
      </Heading>

      <Table>
        <Thead>
          <Tr>
            <Th>Link</Th>
          </Tr>
        </Thead>
        <Tbody>
          {payments?.map((payment) => (
            <Tr key={payment.id}>
              <Td>
                <ChakraLink isExternal href={`/to/${payment.link.hash}`}>
                  {payment.link.metadata
                    ? payment.link.metadata.title
                    : payment.link.hash}
                </ChakraLink>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
}

export default MyTakeOvers;
