import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

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

  if (session?.user) {
    // todo: check whether the user has paid and add the payment / unlock info to the response
  }

  return res.json({
    link,
  });
};

export default handler;
