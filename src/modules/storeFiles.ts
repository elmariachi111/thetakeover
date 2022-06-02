import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import axios from "axios";
const client = new S3Client({ region: "us-east-1" });

export const storeFiles = async (files) => {
  console.log(files);
  const f = files[0];
  const fileName = f.name;
  const presignedUrl = await presignUrl(fileName);
  console.log(presignedUrl);

  // const formData = new FormData();
  // formData.append("file", files[0]);
  const res = await axios.put(presignedUrl, f, {
    headers: {
      "Content-Type": f.type,
    },
  });

  console.log(res.data);
};

const presignUrl = async (fileName: string) => {
  const { url } = (
    await axios.post("/api/files/presign", {
      fileName,
    })
  ).data;

  return url;
};
