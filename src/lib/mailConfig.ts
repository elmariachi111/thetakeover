const prodConf = {
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

const devConf = {
  host: "localhost",
  port: 1025,
  secure: false,
};

const mailServerConfig =
  process.env.NODE_ENV === "production" ? prodConf : devConf;

export default mailServerConfig;
