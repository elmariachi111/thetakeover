//import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import { UploadedFile } from "../types/TakeoverInput";
//const client = new S3Client({ region: "us-east-1" });

export const storeFile = async (
  bundleId: string,
  file: File,
  encrypted?: ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<UploadedFile> => {
  const fileName = file.name;

  const { url: presignedUrl, path } = await presignUrl(bundleId, fileName);

  const res = await axios.put(presignedUrl, encrypted || file, {
    headers: {
      "Content-Type": file.type,
    },
    onUploadProgress: (e) => {
      if (onProgress) {
        const progress = (100 * e.loaded) / e.total;
        onProgress(progress);
      }
    },
  });
  const metadata = await getItemMetadata(path);
  return {
    ...metadata,
    fileName,
    bundleId,
  };
};

export const loadFileFromIpfs = async (cid: string): Promise<ArrayBuffer> => {
  const ipfsUrl = `https://ipfs.filebase.io/ipfs/${cid}`;
  const encryptedContent = await axios.get(ipfsUrl, {
    responseType: "arraybuffer",
  });
  return encryptedContent.data;
};

const getItemMetadata = async (path: string): Promise<UploadedFile> => {
  return (
    await axios.get<UploadedFile>("/api/files/metadata", {
      params: {
        path,
      },
    })
  ).data;
};

const presignUrl = async (bundleId: string, fileName: string) => {
  const { url, path } = (
    await axios.post<{ url: string; path: string }>("/api/files/presign", {
      bundleId,
      fileName,
    })
  ).data;

  return { url, path };
};
