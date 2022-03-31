/*
 eslint-disable @typescript-eslint/ban-ts-comment
*/
import { createHash, randomBytes } from "crypto";
import { Adapter } from "next-auth/adapters";
import { EmailConfig } from "next-auth/providers";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import mailServerConfig from "../../lib/mailConfig";
//@ts-ignore
import tplLogin from "../../mjml/generated/verifyToken.html";

const AUTH_BASE = `${process.env.NEXTAUTH_URL}/api/auth`;

const sendVerificationRequest = async (params: {
  identifier: string;
  url: string;
  expires: Date;
  provider: EmailConfig;
  token: string;
}) => {
  const { host } = new URL(params.url);
  const transport = nodemailer.createTransport(params.provider.server);

  await transport.sendMail({
    to: params.identifier,
    from: params.provider.from,
    subject: `Sign in to ${host}`,
    text: text({ url: params.url, host }),
    html: tplLogin({
      url: params.url,
      host: host,
      email: params.identifier,
    }),
  });
};

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host }: Record<"url" | "host", string>) {
  return `Sign in to ${host}\n${url}\n\n`;
}

export function hashToken(token: string, secret: string) {
  return createHash("sha256").update(`${token}${secret}`).digest("hex");
}

const generateVerificationToken = (): string => {
  return randomBytes(32).toString("hex");
};

const emailProvider = EmailProvider({
  id: "email",
  from: `The Takeover Movement <${process.env.GOOGLE_MAIL_CLIENT_USER}>`,
  server: mailServerConfig,
  sendVerificationRequest: sendVerificationRequest,
  generateVerificationToken,
});
// see next-auth / core / lib / signin : email
const createVerificationSigninUrl = async (
  adapter: Adapter,
  email: string,
  callbackUrl: string
) => {
  const ONE_DAY_IN_SECONDS = 86400;
  const expires = new Date(Date.now() + ONE_DAY_IN_SECONDS * 1000);

  const token =
    (await emailProvider.generateVerificationToken?.()) ??
    generateVerificationToken();

  if (!adapter.createVerificationToken) {
    throw Error("adapter must implement verification token storage");
  }

  await adapter.createVerificationToken({
    identifier: email,
    token: hashToken(
      token,
      emailProvider.secret || (process.env.NEXTAUTH_SECRET as string)
    ),
    expires,
  });

  // Generate a link with email, unhashed token and callback url
  const params = new URLSearchParams({ callbackUrl, token, email });
  const _url = `${AUTH_BASE}/callback/${emailProvider.id}?${params}`;
  return _url;
};

export { sendVerificationRequest, emailProvider, createVerificationSigninUrl };
