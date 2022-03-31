/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Payment } from "@prisma/client";
import { AdapterUser } from "next-auth/adapters";
import nodemailer from "nodemailer";
import mailServerConfig from "../../lib/mailConfig";
//@ts-ignore
import tplPurchase from "../../mjml/generated/purchase.html";
//@ts-ignore
import tplPurchaseNotification from "../../mjml/generated/purchaseNotification.html";
import { XLink } from "../../types/Payment";
import { prismaAdapter } from "./adapter";
import { createVerificationSigninUrl, emailFrom } from "./emailProvider";

const sendBuyerNotification = async (
  transport: any,
  payload: { link: XLink; user: AdapterUser }
) => {
  const { link, user } = payload;
  if (!user.email) {
    throw new Error("the user has no email address");
  }

  const callbackUrl = `${process.env.NEXTAUTH_URL}/to/${link.hash}`;

  const signinUrl = await createVerificationSigninUrl(
    prismaAdapter,
    user.email,
    callbackUrl
  );

  const { host } = new URL(signinUrl);
  return transport.sendMail({
    to: user.email,
    from: emailFrom,
    subject: `Thank you for purchasing ${payload.link.metadata?.title}`,
    text: "text not impl",
    html: tplPurchase({
      email: user.email,
      signinUrl: signinUrl,
      host: host,
    }),
  });
};

const sendSellerNotification = async (
  transport: any,
  payload: { link: XLink; user: AdapterUser; payment: Payment }
) => {
  const { link, user, payment } = payload;

  return transport.sendMail({
    to: link.creator.email,
    from: emailFrom,
    subject: `Someone purchased ${link.metadata?.title}`,
    text: "text not impl",
    html: tplPurchaseNotification({
      link,
      payment,
      host: process.env.NEXTAUTH_URL,
    }),
  });
};

const sendPurchaseConfirmations = async (props: {
  payment: Payment;
  user: AdapterUser;
  link: XLink;
}) => {
  const { payment, user, link } = props;
  const transport = nodemailer.createTransport(mailServerConfig);
  const p1 = sendBuyerNotification(transport, {
    link,
    user,
  });
  const p2 = sendSellerNotification(transport, {
    link,
    user,
    payment,
  });
  await Promise.all([p1, p2]);
};

export { sendPurchaseConfirmations };
