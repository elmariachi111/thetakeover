import { core as Paypal, orders } from "@paypal/checkout-server-sdk";
import { Order } from "@paypal/checkout-server-sdk/lib/orders/lib";
import { PaymentIntent, PaymentStatus, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { default as nextAuth } from "../../auth/[...nextauth]";

import { getSession } from "next-auth/react";

import {
  findOrCreateAndAttachPaypalAccount,
  findOrCreateUser,
} from "../../../../modules/findOrCreateUser";

const prisma = new PrismaClient();
const paypalEnv = new Paypal.SandboxEnvironment(
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
  process.env.PAYPAL_SECRET as string
);

const paypal = new Paypal.PayPalHttpClient(paypalEnv);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  const orderId = req.query.orderId as string;

  const orderRequest = new orders.OrdersGetRequest(orderId);
  const orderResponse = await paypal.execute(orderRequest);
  if (orderResponse.statusCode >= 400) {
    console.error("Paypal error", res.status, res.statusMessage);
    res.status(500).send("Paypal error");
  }

  console.log("orderResponse", JSON.stringify(orderResponse, null, 2));

  const order: Order = await orderResponse.result;
  const purchaseUnit0 = order.purchase_units[0].reference_id;

  const link = await prisma.link.findUnique({
    where: {
      hash: purchaseUnit0,
    },
  });

  if (!link) return res.status(404).send("link not found");

  let user;
  if (order.payer) {
    user = await findOrCreateUser(
      prisma,
      order.payer.email_address,
      //`${order.payer.name.prefix} ${order.payer.name.given_name} ${order.payer.name.middle_name} ${order.payer.name.surname} ${order.payer.name.suffix}`,
      `${order.payer.name.given_name} ${order.payer.name.surname}`,
      session?.user
    );

    // await findOrCreateAndAttachPaypalAccount(
    //   prisma,
    //   user.id,
    //   order.payer.payer_id
    // );
  }

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
      userId: user?.id,
    },
    update: {
      paymentIntent: order.intent as PaymentIntent,
      paymentStatus: order.status as PaymentStatus,
      userId: user?.id,
    },
  });
  return res.json(payment);
};

export default handler;
