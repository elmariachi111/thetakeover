import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { adapterClient } from "../../../../modules/api/adapter";
import { Report } from "../../../../types/Report";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  const linkId = req.query.linkId as string;

  if (req.method !== "POST") {
    return res.status(405).send("method not allowed");
  }

  const report: Report = req.body;

  const link = await adapterClient.link.findUnique({
    where: {
      hash: linkId,
    },
  });

  if (!link) {
    return res.status(404).json({ result: "error", reason: "link not found" });
  }

  if (!session?.user?.id || link.creatorId === session.user.id) {
    return res.status(403).json({
      result: "error",
      reason: "you're not logged in or reported your own content",
    });
  }

  try {
    await adapterClient.userReport.create({
      data: {
        reason: report.reason,
        message: report.message,
        linkHash: linkId,
        reporterId: session.user.id,
      },
    });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ result: "error", reason: e.message });
  }

  return res.status(200).send({ result: "ok" });
};

export default handler;
