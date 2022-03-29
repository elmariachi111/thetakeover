import { Payment } from "@prisma/client";

export type ClientCredentials = {
  scope: string;
  access_token: string;
  token_type: "Bearer";
  app_id: string;
  expires_in: number;
  nonce: string;
};

export type XPayment = Payment & {
  initiatedAt: string;
  paidAt: string | null;
};

export type HateoasResponse = {
  links: [
    {
      href: string;
      rel: string;
      method: string;
      description: string;
    }
  ];
};
