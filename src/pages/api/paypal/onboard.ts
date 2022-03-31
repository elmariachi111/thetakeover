import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import { default as paypal } from "../../../modules/api/paypal";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  const sdk = await paypal(
    process.env.PAYPAL_SDK_ENDPOINT as string,
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
    process.env.PAYPAL_SECRET as string
  );
  const onboardLink = await sdk.startSigningUpMerchant(
    session.user.id,
    `${process.env.NEXTAUTH_URL}/api/paypal/seller`
  );
  if (!onboardLink) {
    return res.status(500).send("couldn't create onboard link");
  }
  return res.redirect(onboardLink);
};

export default handler;
