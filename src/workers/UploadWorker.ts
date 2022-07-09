import { decryptFile, encryptFile } from "../modules/encryption";
import { loadFileFromIpfs, storeFile } from "../modules/storeFiles";
import { UploadedFile } from "../types/TakeoverInput";

type StorePayload = {
  file: File;
  bundleId: string;
  password: Uint8Array;
};

type DecryptPayload = {
  file: UploadedFile;
  password: Uint8Array;
};

type TypedMessage = {
  topic: string;
} & any;

console.log("upload worker installed");

const store = async (payload: StorePayload) => {
  const encrypted = await encryptFile(payload.password, payload.file);

  storeFile(payload.bundleId, payload.file, encrypted, (progress: number) => {
    postMessage({
      topic: "store_progress",
      fileName: payload.file.name,
      progress,
    });
  }).then((uploadedFile) => {
    postMessage({
      topic: "store_finished",
      file: uploadedFile,
    });
  });
};

const downloadAndDecrypt = async (payload: DecryptPayload) => {
  const encrypted = await loadFileFromIpfs(payload.file.cid);
  const decrypted = await decryptFile(encrypted, payload.password);

  postMessage(
    {
      topic: "decrypt_done",
      file: payload.file,
      content: decrypted,
    },
    {
      transfer: [decrypted],
    }
  );
};

addEventListener("message", async (evt) => {
  const message: TypedMessage = evt.data;
  const { topic, ...rest } = message;
  if (topic === "store") {
    store(rest);
  } else if (topic === "decrypt") {
    downloadAndDecrypt(rest);
  }
});
