import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid/async";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uri, price }: { uri: string; price: string } = req.body;
  const session = await getSession({ req });

  const hash = await nanoid();

  const newLink = await prisma.link.create({
    data: {
      hash,
      origin_uri: uri,
      price,
    },
  });

  res.status(200).json({ link: uri, newLink, user: session?.user });
};

export default handler;
