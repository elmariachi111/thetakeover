/*
 eslint-disable @typescript-eslint/ban-ts-comment
*/
import { EmailConfig } from "next-auth/providers";
import nodemailer from "nodemailer";
//@ts-ignore
import tplLogin from "../mjml/generated/verifyToken.html";
//@ts-ignore
import tplPayment from "../mjml/generated/payment.html";

type SendVerificationRequestInterface = (params: {
  identifier: string;
  url: string;
  expires: Date;
  provider: EmailConfig;
  token: string;
}) => Promise<void>;

function buildVerificationRequest(
  type: string
): SendVerificationRequestInterface {
  return async (params: {
    identifier: string;
    url: string;
    expires: Date;
    provider: EmailConfig;
    token: string;
  }) => {
    const { host } = new URL(params.url);
    const transport = nodemailer.createTransport(params.provider.server);
    const template = type === "login" ? tplLogin : tplPayment;

    await transport.sendMail({
      to: params.identifier,
      from: params.provider.from,
      subject: `Sign in to ${host}`,
      text: text({ url: params.url, host }),
      html: template({
        url: params.url,
        host: host,
        email: params.identifier,
        type,
      }),
    });
  };
}

export { buildVerificationRequest };

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host }: Record<"url" | "host", string>) {
  return `Sign in to ${host}\n${url}\n\n`;
}
