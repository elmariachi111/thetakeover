import { SaleStatus } from "@prisma/client";

export type LinkInput = {
  url: string;
  price: number;
  title: string;
  previewImage: string;
  description: string;
  salesActive?: SaleStatus;
};

export type BundleInput = {
  title: string;
  description: string;
  price: number;
  previewImage: string;
  salesActive?: SaleStatus;
  members: string[];
};
