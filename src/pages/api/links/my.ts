import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid/async";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uri, price }: { uri: string; price: string } = req.body;
  const session = await getSession({ req });

  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }
  const links = await prisma.link.findMany({
    where: {
      creatorId: session.user.id,
    },
  });

  res.json(links);
};

export default handler;
