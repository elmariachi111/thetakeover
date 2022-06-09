import { PrismaClient } from "@prisma/client";
import { link } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { NewTakeoverInput } from "../../../types/TakeoverInput";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const prisma = new PrismaClient();
  const session = await getSession({ req });

  const linkId = req.query.linkId as string;
  const oldLink = await prisma.link.findUnique({
    where: {
      hash: linkId,
    },
  });
  if (oldLink?.creatorId != session?.user?.id) {
    return res.status(403).send("you're not owning this asset");
  }

  if (req.method === "DELETE") {
    //todo: delete remote files as well!!
    await prisma.link.delete({
      where: {
        hash: linkId,
      },
    });
    return res.json({
      status: "ok",
      result: "deleted",
    });
  }

  if (req.method === "POST") {
    const { link }: { link: NewTakeoverInput } = req.body;
    //todo: maybe validate by yup again

    await prisma.link.update({
      where: {
        hash: linkId,
      },
      data: {
        price: link.price,
        saleStatus: link.salesActive,
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
