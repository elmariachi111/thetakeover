import { Payment } from "@prisma/client";
import { adapterClient } from "./adapter";

export const findSettledPayment = async (
  linkId: string,
  userId: string
): Promise<Payment | null> => {
  let payment: Payment | null;

  payment = await adapterClient.payment.findFirst({
    where: {
      linkHash: linkId,
      userId: userId,
      paymentStatus: "COMPLETED",
    },
  });
  if (!payment) {
    payment = await adapterClient.payment.findFirst({
      where: {
        link: {
          bundles: {
            some: {
              hash: linkId,
            },
          },
          payments: {
            some: {
              userId: userId,
              paymentStatus: "COMPLETED",
            },
          },
        },
      },
    });
  }

  return payment;
};

export const countPayments = async (linkId: string): Promise<number> => {
  return adapterClient.payment.count({
    where: {
      linkHash: linkId,
      paymentStatus: "COMPLETED",
    },
  });
};
