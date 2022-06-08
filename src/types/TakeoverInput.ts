import { SaleStatus } from "@prisma/client";

export type LinkInput = {
  url: string;
  price: number;
};

export type TOMetadata = {
  title: string;
  previewImage: string;
  salesActive?: SaleStatus;
  description: string;
  price: number;
};

export type NewTakeoverInput = TOMetadata & {
  url?: string;
  files?: UploadedFile[];
  password?: Uint8Array;
};

export type TakeoverBundle = TOMetadata & {
  members: string[];
};

export type UploadedFile = {
  bundleId: string;
  fileName: string;
  contentType: string;
  contentLength: number;
  cid: string;
};
