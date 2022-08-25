import { useToast } from "@chakra-ui/react";
import type {
  CreateOrderActions,
  OnApproveActions,
  OnApproveData,
} from "@paypal/paypal-js";
import { Payment } from "@prisma/client";
import axios from "axios";
import { useState } from "react";
import { DisplayableLink } from "../types/Link";

const PLATFORM_FEE = 0.05;

export const usePaypalActions = (link: DisplayableLink) => {
  const toast = useToast();
  const [payment, setPayment] = useState<Payment>();

  const errorHandler = (e: any) => {
    toast({
      status: "warning",
      title: "Payment failed. Nothing has been charged",
      description: `Reason: ${e.message}`,
    });
  };

  const createOrder = async (
    _data: Record<string, unknown>,
    actions: CreateOrderActions
  ) => {
    const description = `Takeover ${link.hash} by ${link.creator.name}`;
    const amount = {
      currency_code: "EUR",
      value: `${link.price}`,
    };

    const orderId = await actions.order.create({
      intent: "CAPTURE",

      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
      purchase_units: [
        {
          reference_id: link.hash as string,
          description,
          amount: {
            ...amount,
            breakdown: {
              item_total: amount,
            },
          },
          items: [
            {
              name: description,
              quantity: "1",
              unit_amount: amount,
              category: "DIGITAL_GOODS",
              description: description,
            },
          ],
          /*
           * consider adding payee information (needs their email address)
           * https://developer.paypal.com/api/orders/v2/#definition-purchase_unit_request
           */
          payment_instruction: {
            disbursement_mode: "INSTANT",
            platform_fees: [
              {
                amount: {
                  currency_code: "EUR",
                  value: (PLATFORM_FEE * link.price).toFixed(2),
                },
              },
            ],
          },
        },
      ],
    });
    try {
      await axios.post(`/api/to/pay/${orderId}`);
    } catch (e: any) {
      errorHandler(e);
      throw e;
    }
    //console.log(orderId);
    return orderId;
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) return;
    try {
      const details = await actions.order.capture();
      const res = await axios.post(`/api/to/pay/${details.id}`);
      setPayment(await res.data);
    } catch (e: any) {
      errorHandler(e);
    }
  };

  return {
    createOrder,
    onApprove,
    payment,
  };
};
