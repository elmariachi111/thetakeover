import { Payment } from "@prisma/client";

export type XPayment = Payment & {
  initiatedAt: string;
  paidAt: string | null;
};
