// import { NextApiRequest, NextApiResponse } from "next";
// import { getProviders } from "next-auth/react";
// import { emailProvider } from "../auth/[...nextauth]";

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   const token = await emailProvider.generateVerificationToken();

//   emailProvider.sendVerificationRequest({
//     identifier: "stadolf@the-takeover.com",
//     provider: emailProvider.options.server,

//   })
// };

// export default handler;

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     type: "OAuth2",
//     user: process.env.GOOGLE_MAIL_CLIENT_USER,
//     serviceClient: process.env.GOOGLE_MAIL_CLIENT_ID,
//     privateKey: process.env.GOOGLE_MAIL_CLIENT_KEY,
//   },
//   logger: true,
// });
// const message = {
//   from: process.env.GOOGLE_MAIL_CLIENT_USER,
//   to: "stadolf@gmail.com",
//   subject: "A test message",
//   text: "Some Plaintext version of the message",
//   html: "<p>TAhats html version of the message</p>",
// };
// const result = await transporter.sendMail(message);
// console.log(result);
// return res.json({ res: result });
