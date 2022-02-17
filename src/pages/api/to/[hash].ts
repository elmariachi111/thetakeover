import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid/async";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  const link = await prisma.link.findUnique({
    where: {
      hash: req.query.hash as string,
    },
  });

  if (!link) return res.status(404).send("link not found");

  if (session?.user?.id === link.creatorId) {
    return res.redirect(301, link.origin_uri);
  } else if (!session?.user?.id) {
    return res.redirect(307, `/to/pay/${link?.hash}`);
  }

  const payment = await prisma.payment.findFirst({
    where: {
      link_hash: link.hash,
      userId: session.user.id,
    },
  });

  if (!payment || !payment.paidAt) {
    return res.redirect(307, `/to/pay/${link?.hash}`);
  }

  if (payment.paidAt < new Date()) {
    return res.redirect(307, link.origin_uri);
  }
};

export default handler;
