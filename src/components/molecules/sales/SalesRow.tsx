import {
  Icon,
  Link,
  Td,
  Text,
  Tr,
  useColorModeValue,
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
    if (!orderDetails) return [];
    const breakdown =
      orderDetails.purchase_units[0].payments.captures[0]
        .seller_receivable_breakdown;
    if (!breakdown) return [];
    const fees: SalesRowDetails[] = [];
    fees.push({
      type: "gross_amount",
      amount: paypalAmountObjectToString(breakdown["gross_amount"]),
    });
    fees.push({
      type: "paypal_fee",
      amount: paypalAmountObjectToString(breakdown["paypal_fee"]),
      negative: true,
    });
    fees.push({
      type: "platform_fees",
      amount: paypalAmountObjectToString(breakdown.platform_fees[0].amount),
      negative: true,
    });
    fees.push({
      type: "net_amount",
      amount: paypalAmountObjectToString(breakdown["net_amount"]),
    });
    return fees;
  }, [orderDetails]);

  return (
    <>
      <Tr>
        <Td>{formatTime(payment.initiatedAt)}</Td>
        <Td title={payment.link.hash}>
          <NextLink href={`/to/${payment.link.hash}`} passHref>
            <Link>{payment.link.metadata?.title}</Link>
          </NextLink>
        </Td>
        <Td>
          <Text isTruncated>{payment.user.id}</Text>
        </Td>
        <Td>{payment.link.price}</Td>
        <Td>
          {orderDetails ? (
            <Icon
              sx={{ cursor: "pointer" }}
              as={FaCaretUp}
              onClick={() => setOrderDetails(undefined)}
            />
          ) : (
            <Icon
              sx={{ cursor: "pointer" }}
              as={FaCaretDown}
              onClick={() => fetchOrderDetails(payment.id)}
            />
          )}
        </Td>
      </Tr>
      {orderDetails && (
        <Tr fontSize="sm" background={detailsBg}>
          <Td colSpan={5}>
            <VStack gap={3}>
              <TableItem label="Payment Reference" value={payment.paymentRef} />
              <TableItem
                label="Payer Email"
                value={orderDetails.payer.email_address}
              />
              {fees.map((f) => (
                <TableItem
                  key={`cap-${orderDetails.id}-${f.type}`}
                  label={f.type}
                  value={f.amount}
                  negative={f.negative}
                />
              ))}
            </VStack>
          </Td>
        </Tr>
      )}
    </>
  );
};
