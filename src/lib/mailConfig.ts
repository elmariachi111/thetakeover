const mailServerConfig = {
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
};

export default mailServerConfig;
