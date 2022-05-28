import { core as Paypal, orders } from "@paypal/checkout-server-sdk";
import { Order } from "@paypal/checkout-server-sdk/lib/orders/lib";
import { PaymentIntent, PaymentStatus, PrismaClient } from "@prisma/client";
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
  const purchaseUnit0 = order.purchase_units[0].reference_id;

  const link = await prisma.link.findUnique({
    where: {
      hash: purchaseUnit0,
    },
    select: {
      hash: true,
      creator: true,
      creatorId: true,
      metadata: true,
      saleStatus: true,
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
    const sessionCookies = await loginPayer(req, user);
    sessionCookies.forEach((cookie) => setCookie(res, cookie));
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
      linkHash: link.hash,
      userId: user?.id,
    },
    update: {
      paymentIntent: order.intent as PaymentIntent,
      paymentStatus: order.status as PaymentStatus,
      userId: user?.id,
    },
  });

  if (order.status === PaymentStatus.COMPLETED) {
    if (!user) {
      throw new Error("a user should exist here");
    }
    await sendPurchaseConfirmations({
      payment,
      user,
      link,
    });
  }

  return res.json(payment);
};

export default handler;
