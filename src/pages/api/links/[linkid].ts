import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const link = await prisma.link.findUnique({
    where: {
      hash: req.query.linkid as string,
    },
    select: {
      hash: true,
      price: true,
      metadata: {
        select: {
          title: true,
          description: true,
          previewImage: true,
        },
      },
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
