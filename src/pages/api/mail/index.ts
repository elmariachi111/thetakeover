// import { NextApiRequest, NextApiResponse } from "next";
// import { encode } from "next-auth/jwt";
// import { SessionStore, setCookie } from "../../../lib/cookie";

//https://github.com/nextauthjs/next-auth/blob/8d7ba75bca2f8a076ff53d55e1916a157e084b1e/packages/next-auth/src/core/routes/callback.ts

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   const secureCookie =
//     process.env.NEXTAUTH_URL?.startsWith("https://") ?? !!process.env.VERCEL;
//   const cookieName = secureCookie
//     ? "__Secure-next-auth.session-token"
//     : "next-auth.session-token";

//   const secret = process.env.NEXTAUTH_SECRET as string;

//   const user = {
//     name: "Samson",
//     email: "samson@sss.ss",
//     image: "",
//     id: "SAMSON1",
//   };

//   const token = {
//     name: user.name,
//     email: user.email,
//     picture: user.image,
//     uid: user.id,
//     sub: user.id?.toString(),
//   };

//   // const account = {

//   // }
//   // const token = await callbacks.jwt({
//   //   token: defaultToken,
//   //   user,
//   //   // @ts-expect-error
//   //   account,
//   //   profile: OAuthProfile,
//   //   isNewUser,
//   // })

//   // Refresh JWT expiry by re-signing it, with an updated expiry date
//   const sessionMaxAge = 30 * 60 * 60;
//   const newToken = await encode({
//     secret,
//     token,
//     maxAge: sessionMaxAge,
//   });

//   // Set cookie expiry date
//   const cookieExpires = new Date();
//   cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1000);

//   const sessionStore = new SessionStore(
//     {
//       name: cookieName,
//       options: {
//         secure: secureCookie,
//         path: "/",
//         sameSite: "lax",
//         httpOnly: true,
//       },
//     },
//     { cookies: req.cookies, headers: req.headers },
//     console
//   );

//   // Set cookie, to also update expiry date on cookie
//   const sessionCookies = sessionStore.chunk(newToken, {
//     expires: cookieExpires,
//   });

//   sessionCookies.forEach((cookie) => setCookie(res, cookie));
//   res.send(200);
// };

// export default handler;

import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.GOOGLE_MAIL_CLIENT_USER,
      serviceClient: process.env.GOOGLE_MAIL_CLIENT_ID,
      privateKey: process.env.GOOGLE_MAIL_CLIENT_KEY,
    },
    logger: true,
  });
  const message = {
    from: process.env.GOOGLE_MAIL_CLIENT_USER,
    to: "stadolf@gmail.com",
    subject: "A test message",
    text: "Some Plaintext version of the message",
    html: "<p>TAhats html version of the message</p>",
  };
  const result = await transporter.sendMail(message);
  console.log(result);
  return res.json({ res: result });
};

export default handler;
