import {
  Heading,
  Link as ChakraLink,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Payment } from "@prisma/client";

export const MyPaymentsView = ({ payments }: { payments: any }) => {
  if (payments.length === 0) return null;
  return (
    <>
      <Heading fontSize="xl" mt={12} mb={6}>
        Purchases
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
    </>
  );
};
