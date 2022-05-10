import { SaleStatus } from "@prisma/client";

export type LinkInput = {
  url: string;
  price: number;
  title: string;
  previewImage: string;
  description: string;
  embed: string;
  salesActive: SaleStatus;
};
