import {
  Icon,
  Link,
  Slide,
  SlideFade,
  Td,
  Text,
  Tr,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useMemo, useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import {
  formatTime,
  paypalAmountObjectToString,
} from "../../../modules/strings";
import { OrderDetailsResponse, XSalesPayment } from "../../../types/Payment";
import { TableItem } from "../../atoms/TableItem";
import { default as NextLink } from "next/link";

type SalesRowDetails = { type: string; amount: string; negative?: boolean };
export const SalesRow = ({ payment }: { payment: XSalesPayment }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse>();
  const { isOpen: showDetails, onToggle: toggleDetails } = useDisclosure();

  const detailsBg = useColorModeValue("gray.200", "gray.800");

  const fetchOrderDetails = async (paymentId: string) => {
    const order = await axios.get("/api/paypal/order", {
      params: {
        paymentId,
      },
    });
    console.log(order.data);
    setOrderDetails(order.data);
  };

  const fees = useMemo<Array<SalesRowDetails>>(() => {
    if (!payment.breakdown) return [];
    const fees: SalesRowDetails[] = [];

    fees.push({
      type: "gross_amount",
      amount: paypalAmountObjectToString(payment.breakdown["gross_amount"]),
    });
    fees.push({
      type: "paypal_fee",
      amount: paypalAmountObjectToString(payment.breakdown["paypal_fee"]),
      negative: true,
    });
    fees.push({
      type: "platform_fees",
      amount: paypalAmountObjectToString(
        payment.breakdown["platform_fees"][0].amount
      ),
      negative: true,
    });
    fees.push({
      type: "net_amount",
      amount: paypalAmountObjectToString(payment.breakdown["net_amount"]),
    });
    return fees;
  }, [payment.breakdown]);

  return (
    <>
      <Tr onClick={toggleDetails}>
        <Td>{formatTime(payment.initiatedAt)}</Td>
        <Td title={payment.link.hash}>
          <NextLink href={`/to/${payment.link.hash}`} passHref>
            <Link>{payment.link.metadata?.title}</Link>
          </NextLink>
        </Td>
        <Td>
          <Text isTruncated>{payment.user.id}</Text>
        </Td>
        <Td>
          <Text whiteSpace="nowrap">
            {payment.value} {payment.currencyCode}
          </Text>
        </Td>
        <Td>
          {showDetails ? (
            <Icon sx={{ cursor: "pointer" }} as={FaCaretUp} />
          ) : (
            <Icon sx={{ cursor: "pointer" }} as={FaCaretDown} />
          )}
        </Td>
      </Tr>

      {showDetails && (
        <Tr fontSize="sm" background={detailsBg}>
          <Td colSpan={5} position="relative">
            <SlideFade in={showDetails}>
              <VStack gap={3}>
                <TableItem
                  label="Payment Reference"
                  value={payment.paymentRef}
                />
                <TableItem label="Payer Email" value={payment.user.email} />
                {fees.map((f) => (
                  <TableItem
                    key={`cap-${payment.id}-${f.type}`}
                    label={f.type}
                    value={f.amount}
                    negative={f.negative}
                  />
                ))}
              </VStack>
            </SlideFade>
          </Td>
        </Tr>
      )}
    </>
  );
};
