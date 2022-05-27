import { nanoid } from "nanoid/async";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { adapterClient } from "../../../modules/api/adapter";
import { BundleInput } from "../../../types/LinkInput";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload: BundleInput = req.body;
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  console.debug(payload);

  const hash = await nanoid();

  const newLink = await adapterClient.link.create({
    data: {
      hash,
      price: payload.price,
      creator: {
        connect: {
          id: session.user.id,
        },
      },
      bundles: {
        connect: payload.members.map((m) => ({ hash: m })),
      },
      metadata: {
        create: {
          description: payload.description,
          title: payload.title,
          previewImage: payload.previewImage,
        },
      },
    },
  });

  const newUrl = `${process.env.NEXTAUTH_URL}/to/${hash}`;

  res.status(200).json({
    status: "ok",
    hash,
    newUrl,
  });
};

export default handler;
