import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid/async";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const link = await prisma.link.findUnique({
    where: {
      hash: req.query.hash as string,
    },
    select: {
      hash: true,
      price: true,
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!link) return res.status(404).send("link not found");

  return res.json({
    link,
  });
};

export default handler;
