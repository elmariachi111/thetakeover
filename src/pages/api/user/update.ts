import { User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { adapterClient } from "../../../modules/api/adapter";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user: User = req.body;
  const session = await getSession({ req });

  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  if (session.user.id !== user.id) {
    return res.status(400).json({
      message: "Bad Request",
      reason: "The user ids of your submission and the session don't match",
    });
  }

  const userData = await adapterClient.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!userData) {
    return res.status(400).json({
      message: "Bad Request",
      reason: "This user is not in our db anymore",
    });
  }

  await adapterClient.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name: user.name,
      email: user.email,
      emailVerified: user.email === userData.email ? undefined : null,
    },
  });

  return res.status(200).json({
    message: "ok",
    reason: "user updated",
  });
};

export default handler;
