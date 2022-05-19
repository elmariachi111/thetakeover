import { PrismaClient, SellerAccount } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import paypal from "../../../modules/api/paypal";
import { paypalNameObjectToString } from "../../../modules/strings";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const merchantInfo = await paypal.getMerchantInfo(
    req.query.merchantIdInPayPal as string
  );

  const user = await prisma.user.findUnique({
    where: {
      id: req.query.merchantId as string,
    },
  });
  if (!user) {
    throw new Error(`User ${req.query.merchantId} doesnt exist`);
  }

  const sellerAccount = {
    userId: req.query.merchantId as string,
    merchantIdInPayPal: req.query.merchantIdInPayPal as string,
    accountStatus: req.query.accountStatus as string,
    riskStatus: req.query.riskStatus as string,
    productIntentId: req.query.productIntentId as string,
    isEmailConfirmed: req.query.isEmailConfirmed === "true",
    permissionsGranted: req.query.permissionsGranted === "true",
    consentStatus: req.query.consentStatus === "true",
    country: merchantInfo.country || "DE",
    paymentsReceivable: merchantInfo.payments_receivable,
    primaryEmail: merchantInfo.primary_email || null,
    primary_currency: merchantInfo.primary_currency,
    userName: paypalNameObjectToString(merchantInfo),
  };

  await prisma.sellerAccount.create({
    data: {
      ...sellerAccount,
    },
  });

  if (!user.email) {
    user.email = sellerAccount.primaryEmail;
    if (sellerAccount.isEmailConfirmed) {
      user.emailVerified = new Date();
    }
  }

  if (!user.name) {
    user.name = sellerAccount.userName;
  }

  try {
    await prisma.user.update({
      where: {
        id: sellerAccount.userId,
      },
      data: user,
    });
  } catch (e: any) {
    console.error(e);
  }
  return res.redirect("/profile");
};

export default handler;
