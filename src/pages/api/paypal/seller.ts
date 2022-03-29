import { PrismaClient, SellerAccount } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const sellerAccount = {
    userId: req.query.merchantId as string,
    merchantIdInPayPal: req.query.merchantIdInPayPal as string,
    accountStatus: req.query.accountStatus as string,
    riskStatus: req.query.riskStatus as string,
    productIntentId: req.query.productIntentId as string,
    isEmailConfirmed: req.query.isEmailConfirmed === "true",
    permissionsGranted: req.query.permissionsGranted === "true",
    consentStatus: req.query.consentStatus === "true",
  };

  const account = await prisma.sellerAccount.create({
    data: {
      ...sellerAccount,
    },
  });

  //todo: redirect to profile.
  return res.status(200).json({ account });
};

export default handler;
