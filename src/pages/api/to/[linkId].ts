import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { LinkInput } from "../../../types/LinkInput";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const prisma = new PrismaClient();
  const session = await getSession({ req });
  //todo: check that user is owning the content.
  //todo: maybe validate by yup again

  const linkId = req.query.linkId as string;

  if (req.method === "POST") {
    const { link }: { link: LinkInput } = req.body;
    console.log(link);

    const oldLink = await prisma.link.findUnique({
      where: {
        hash: linkId,
      },
    });

    if (oldLink?.creatorId != session?.user?.id) {
      return res.status(403).send("you're not owning this asset");
    }

    await prisma.link.update({
      where: {
        hash: linkId,
      },
      data: {
        price: link.price,
      },
    });

    await prisma.metadata.update({
      where: {
        linkHash: linkId,
      },
      data: {
        description: link.description,
        previewImage: link.previewImage,
        title: link.title,
      },
    });

    return res.status(200).send({ result: "ok" });
  } else {
    return res.status(405).send("method not allowed");
  }
};

export default handler;
