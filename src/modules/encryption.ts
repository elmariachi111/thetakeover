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

export const decryptFile = async (
  content: ArrayBuffer,
  password: Uint8Array
): Promise<ArrayBuffer> => {
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
): Promise<Uint8Array> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await PBKDF2(password, salt, 100000, 256, "SHA-256");
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      await infile.arrayBuffer()
    )
  );

  const pfxEncrypted = new Uint8Array(16 + 16 + encrypted.byteLength);

  pfxEncrypted.set(salt, 0);
  pfxEncrypted.set(iv, 16);
  pfxEncrypted.set(encrypted, 32);

  return pfxEncrypted;
};
