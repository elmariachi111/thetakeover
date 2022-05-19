import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import paypal from "../../../modules/api/paypal";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  const onboardLink = await paypal.startSigningUpMerchant(
    session.user.id,
    `${process.env.NEXTAUTH_URL}/api/paypal/seller`
  );
  if (!onboardLink) {
    return res.status(500).send("couldn't create onboard link");
  }
  console.log(onboardLink);
  return res.redirect(onboardLink);
};

export default handler;
