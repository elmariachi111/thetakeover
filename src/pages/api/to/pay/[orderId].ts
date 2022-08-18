import { core as Paypal, orders } from "@paypal/checkout-server-sdk";
import { Order } from "@paypal/checkout-server-sdk/lib/orders/lib";
import {
  PaymentIntent,
  PaymentStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { setCookie } from "../../../../lib/cookie";
import {
  findOrCreateAndAttachPaypalAccount,
  findOrCreateUser,
} from "../../../../modules/api/findOrCreateUser";
import { loginPayer } from "../../../../modules/api/loginPayer";
import { sendPurchaseConfirmations } from "../../../../modules/api/sendPurchaseConfirmation";
import { paypalNameObjectToString } from "../../../../modules/strings";

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

  //console.log("orderResponse", JSON.stringify(orderResponse, null, 2));

  const order: Order = await orderResponse.result;
  const purchaseUnit0 = order.purchase_units[0];

  const link = await prisma.link.findUnique({
    where: {
      hash: purchaseUnit0.reference_id,
    },
    select: {
      hash: true,
      creator: true,
      creatorId: true,
      metadata: true,
      saleStatus: true,
      price: true,
    },
  });

  if (!link) return res.status(404).send("link not found");
  if (link.saleStatus !== "ON_SALE") {
    return res.status(403).send("item is not on sale");
  }

  const sellerAccount = await prisma.sellerAccount.findFirst({
    where: {
      userId: link.creatorId,
    },
  });

  if (!sellerAccount || !sellerAccount.isActive) {
    return res.status(403).send("seller is not onboarded");
  }

  let user;
  if (order.payer) {
    user = await findOrCreateUser(
      prisma,
      order.payer.email_address,
      paypalNameObjectToString(order.payer.name),
      session?.user
    );
    console.log(
      "user %s found or created from payment email address %s",
      user.id,
      order.payer.address
    );

    try {
      await findOrCreateAndAttachPaypalAccount(
        prisma,
        user.id,
        order.payer.payer_id
      );
      console.log(
        "found or created paypal account for user %s / payer %s",
        user.id,
        order.payer.payer_id
      );
    } catch (e: any) {
      console.error(
        "the paypal account of [%s] has been attached to another user [%s]",
        order.payer.email_address,
        user.id
      );
    }
    if (!session?.user) {
      const sessionCookies = await loginPayer(req, user);
      sessionCookies.forEach((cookie) => setCookie(res, cookie));
    }
  }

  const capture0 = purchaseUnit0.payments?.captures[0];

  const breakdown = capture0
    ? (capture0.seller_receivable_breakdown as unknown as Prisma.InputJsonObject)
    : {};

  //console.log("upserting order / payment", JSON.stringify(order, null, 2));

  const payment = await prisma.payment.upsert({
    where: {
      paymentRef: order.id,
    },
    create: {
      paymentRef: order.id,
      provider: "PAYPAL",
      paymentIntent: order.intent as PaymentIntent,
      paymentStatus: order.status as PaymentStatus,
      transactionId: capture0 ? capture0.id : null,
      linkHash: link.hash,
      userId: user?.id,
      payee: purchaseUnit0.payee.merchant_id || null,
      value: purchaseUnit0.amount.value,
      currencyCode: purchaseUnit0.amount.currency_code,
      breakdown: breakdown,
    },
    update: {
      paymentIntent: order.intent as PaymentIntent,
      paymentStatus: order.status as PaymentStatus,
      userId: user?.id,
      transactionId: capture0?.id,
      currencyCode: capture0?.amount.currency_code,
      value: capture0?.amount.value,
      breakdown,
    },
  });

  if (order.status === PaymentStatus.COMPLETED) {
    if (!user) {
      throw new Error("a user should exist here");
    }
    await sendPurchaseConfirmations({
      payment,
      user,
      link: JSON.parse(JSON.stringify(link)),
    });
  }

  return res.json(payment);
};

export default handler;
