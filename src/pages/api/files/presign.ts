import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextApiRequest, NextApiResponse } from "next";

const s3 = new S3Client({
  region: process.env.FILEBASE_REGION,
  endpoint: process.env.FILEBASE_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.FILEBASE_KEY as string,
    secretAccessKey: process.env.FILEBASE_SECRET as string,
  },
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_FILEBASE_BUCKET_NAME as string,
    Key: req.body.fileName,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return res.send({ url });
};

export default handler;
