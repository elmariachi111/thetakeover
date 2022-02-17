import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  const link = await prisma.link.findUnique({
    where: {
      hash: req.query.hash as string,
    },
  });

  if (!link) return res.status(404).send("link not found");

  const paymentRef = "" + Math.random();
  const payment = await prisma.payment.create({
    data: {
      paymentRef,
      link_hash: link.hash,
      userId: session.user.id,
      paidAt: new Date(),
    },
  });

  return res.json(payment);
};

export default handler;
