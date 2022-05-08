import { PrismaClient } from "@prisma/client";
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

  await prisma.sellerAccount.create({
    data: {
      ...sellerAccount,
    },
  });

  return res.redirect("/my");
};

export default handler;
