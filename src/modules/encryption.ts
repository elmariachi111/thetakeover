import { UploadedFile } from "../types/TakeoverInput";
import { loadFileFromIpfs } from "./storeFiles";

const PBKDF2 = async (
  password: Uint8Array,
  salt: Uint8Array,
  iterations: number,
  length: number,
  hash: string,
  algorithm = "AES-CBC"
): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    password,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations,
      hash,
    },
    keyMaterial,
    { name: algorithm, length },
    false,
    ["encrypt", "decrypt"]
  );
};

export const downloadAndDecrypt = async (
  file: UploadedFile,
  password: Uint8Array
): Promise<ArrayBuffer> => {
  const content = await loadFileFromIpfs(file.cid);

  const salt = new Uint8Array(content.slice(0, 16));
  const iv = new Uint8Array(content.slice(16, 32));
  const encrypted = new Uint8Array(content.slice(32));

  const key = await PBKDF2(password, salt, 100000, 256, "SHA-256");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    encrypted
  );

  return decrypted;
};

export const encryptFile = async (
  password: Uint8Array,
  infile: File
): Promise<{
  salt: Uint8Array;
  iv: Uint8Array;
  encrypted: Promise<ArrayBuffer>;
}> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await PBKDF2(password, salt, 100000, 256, "SHA-256");
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encrypted = crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    await infile.arrayBuffer()
  );

  return {
    salt,
    iv,
    encrypted,
  };
};
