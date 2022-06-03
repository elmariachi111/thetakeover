import { nanoid } from "nanoid/async";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { adapterClient } from "../../../modules/api/adapter";
import { NewTakeoverInput } from "../../../types/TakeoverInput";
import { extractOembed } from "./oembed";
import canonicalUrl from "../../../modules/api/canonicalUrl";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload: NewTakeoverInput = req.body;
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  const hash = await nanoid();

  let oembed;
  try {
    if (payload.url) {
      oembed = await extractOembed(payload.url);
    }
  } catch (e: any) {
    oembed = undefined;
  }

  try {
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
        linkHash: hash,
        description: payload.description,
        title: payload.title,
        previewImage: payload.previewImage,
        oembed,
      },
    });

    const newUrl = `${canonicalUrl}/to/${hash}`;

    res.status(200).json({
      status: "ok",
      hash,
      newUrl,
    });
  } catch (e: any) {
    console.error(e);
    const reason =
      e.meta?.target == "Link_originUri_key"
        ? "someone used that link already"
        : e.message;
    res.status(500).json({
      status: "error",
      reason,
    });
  }
};

export default handler;
