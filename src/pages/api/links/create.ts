import { nanoid } from "nanoid/async";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { adapterClient } from "../../../modules/api/adapter";
import { LinkInput } from "../../../types/LinkInput";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload: LinkInput = req.body;
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  const hash = await nanoid();

  console.log(payload);

  const newLink = await adapterClient.link.create({
    data: {
      hash,
      originUri: payload.url,
      price: payload.price,
      creatorId: session.user.id,
    },
  });

  const md = await adapterClient.metadata.create({
    data: {
      description: payload.description,
      title: payload.title,
      previewImage: payload.previewImage,
      embed: payload.embed,
      linkHash: hash,
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
