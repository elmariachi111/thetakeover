import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }
  const links = await prisma.link.findMany({
    where: {
      creatorId: session.user.id,
    },
    include: {
      _count: {
        select: { payments: true },
      },
    },
  });

  res.json(links);
};

export default handler;
