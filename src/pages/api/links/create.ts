import type { NextApiRequest, NextApiResponse } from "next";
import { Metadata, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid/async";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    uri,
    price,
    metadata,
  }: { uri: string; price: string; metadata: Metadata } = req.body;
  const session = await getSession({ req });

  const hash = await nanoid();
  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  console.log(uri, price, metadata);

  const newLink = await prisma.link.create({
    data: {
      hash,
      origin_uri: uri,
      price,
      creatorId: session.user.id,
    },
  });

  const md = await prisma.metadata.create({
    data: {
      ...metadata,
      linkHash: hash,
    },
  });

  res.status(200).json({ link: uri, newLink });
};

export default handler;
