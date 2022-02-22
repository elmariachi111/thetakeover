import { PaymentIntent, PaymentStatus, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { core as Paypal, orders } from "@paypal/checkout-server-sdk";
import { Order } from "@paypal/checkout-server-sdk/lib/orders/lib";

const prisma = new PrismaClient();
const paypalEnv = new Paypal.SandboxEnvironment(
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
  process.env.PAYPAL_SECRET as string
);

const paypal = new Paypal.PayPalHttpClient(paypalEnv);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  const orderId = req.query.orderId as string;

  const orderRequest = new orders.OrdersGetRequest(orderId);
  const orderResponse = await paypal.execute(orderRequest);
  if (orderResponse.statusCode >= 400) {
    console.error("Paypal error", res.status, res.statusMessage);
    res.status(500).send("Paypal error");
  }

  const order: Order = await orderResponse.result;
  const purchaseUnit0 = order.purchase_units[0].reference_id;

  const link = await prisma.link.findUnique({
    where: {
      hash: purchaseUnit0,
    },
  });

  if (!link) return res.status(404).send("link not found");

  const payment = await prisma.payment.upsert({
    where: {
      paymentRef: order.id,
    },
    create: {
      paymentRef: order.id,
      provider: "PAYPAL",
      paymentIntent: order.intent as PaymentIntent,
      paymentStatus: order.status as PaymentStatus,
      link_hash: link.hash,
      userId: session.user.id,
    },
    update: {
      paymentIntent: order.intent as PaymentIntent,
      paymentStatus: order.status as PaymentStatus,
    },
  });

  return res.json(payment);
};

export default handler;
