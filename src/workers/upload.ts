import { encryptFile } from "../modules/encryption";
import { storeFile } from "../modules/storeFiles";

type Payload = {
  file: File;
  index: number;
  password: Uint8Array;
};

console.log("upload worker installed");

addEventListener("message", async (evt) => {
  const payload: Payload = evt.data;

  const response = await encryptFile(payload.password, payload.file);
  const encrypted = new Uint8Array(await response.encrypted);
  const binaryUpload = new Uint8Array(16 + 16 + encrypted.byteLength);

  binaryUpload.set(response.salt, 0);
  binaryUpload.set(response.iv, 16);
  binaryUpload.set(encrypted, 32);

  storeFile(payload.file, binaryUpload, (progress: number) => {
    postMessage({
      type: "progress",
      fileName: payload.file.name,
      index: payload.index,
      progress,
    });
  }).then((uploadedFile) => {
    postMessage({
      type: "finished",
      file: uploadedFile,
    });
  });
});
