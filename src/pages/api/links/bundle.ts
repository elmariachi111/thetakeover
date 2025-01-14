import { nanoid } from "nanoid/async";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { adapterClient } from "../../../modules/api/adapter";
import canonicalUrl from "../../../modules/api/canonicalUrl";
import { findLinks } from "../../../modules/api/findLink";
import { TakeoverBundle } from "../../../types/TakeoverInput";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload: TakeoverBundle = req.body;
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  if (!payload.members) {
    return res.status(400).json({
      status: "error",
      message: "payload.members is missing",
    });
  }
  console.debug(payload);

  const members = await findLinks(payload.members);
  const bundles = members.filter((m) => m.bundles.length > 0);
  if (bundles.length > 0) {
    return res.status(400).json({
      status: "error",
      message: "bundles mustn't contain other bundles",
    });
  }

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

  const newUrl = `${canonicalUrl}/to/${hash}`;

  res.status(200).json({
    status: "ok",
    hash,
    newUrl,
  });
};

export default handler;
