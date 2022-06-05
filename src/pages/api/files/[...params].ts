import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextApiRequest, NextApiResponse } from "next";
import { DefaultUser } from "next-auth";
import { getSession } from "next-auth/react";

const s3 = new S3Client({
  region: process.env.FILEBASE_REGION,
  endpoint: process.env.FILEBASE_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.FILEBASE_KEY as string,
    secretAccessKey: process.env.FILEBASE_SECRET as string,
  },
});

const handlers = {
  presign: async (
    req: NextApiRequest,
    res: NextApiResponse,
    user: DefaultUser
  ) => {
    if (!(req.method === "POST")) throw new Error("wrong method, try POST");
    const path = `${user.id}/${req.body.fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_FILEBASE_BUCKET_NAME as string,
      Key: path,
      //ServerSideEncryption: "AES256",
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return res.json({ url, path });
  },
  metadata: async (
    req: NextApiRequest,
    res: NextApiResponse,
    user: DefaultUser
  ) => {
    if (!(req.method === "GET")) throw new Error("wrong method, try GET");

    const path = req.query.path;
    if (typeof path !== "string") throw new Error("path must be string");

    const command = new HeadObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_FILEBASE_BUCKET_NAME as string,
      Key: path,
    });
    const headData = await s3.send(command);
    return res.json({
      lastModified: headData.LastModified,
      contentType: headData.ContentType,
      contentLength: headData.ContentLength,
      cid: headData.Metadata?.cid,
    });
  },
};

//todo add a rate limit per user
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }

  const handlerName = req.query.params[0];
  if (!handlerName || !handlers[handlerName]) {
    return res.status(404).send(`handler ${handlerName} not found`);
  }

  return handlers[handlerName](req, res, session.user);
};

export default handler;
