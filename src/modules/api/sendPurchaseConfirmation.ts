/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Payment } from "@prisma/client";
import { AdapterUser } from "next-auth/adapters";
import nodemailer from "nodemailer";
import mailServerConfig from "../../lib/mailConfig";
//@ts-ignore
import tplPurchase from "../../mjml/generated/purchase.html";
import { XLink } from "../../types/Payment";
import { prismaAdapter } from "./adapter";
import { createVerificationSigninUrl, emailProvider } from "./emailProvider";

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
  console.log(signinUrl);

  const { host } = new URL(signinUrl);
  await transport.sendMail({
    to: user.email,
    from: emailProvider.from,
    subject: `Thank you for purchasing ${payload.link.metadata?.title}`,
    text: "text not impl",
    html: tplPurchase({
      email: user.email,
      signinUrl: signinUrl,
      host: host,
    }),
  });
};

// const sendSellerNotification = () => {
//   await transport.sendMail({
//     to: params.identifier,
//     from: params.provider.from,
//     subject: `Sign in to ${host}`,
//     text: text({ url: params.url, host }),
//     html: template({
//       url: params.url,
//       host: host,
//       email: params.identifier,
//       type,
//     }),
//   });
// };

const sendPurchaseConfirmations = async (props: {
  payment: Payment;
  user: AdapterUser;
  link: XLink;
}) => {
  const { payment, user, link } = props;
  const transport = nodemailer.createTransport(mailServerConfig);
  await sendBuyerNotification(transport, {
    link,
    user,
  });
};

export { sendPurchaseConfirmations };
