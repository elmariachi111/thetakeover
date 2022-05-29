import { Metadata, Payment, User } from "@prisma/client";
import { PaypalNameObject } from "../modules/strings";

export type ClientCredentials = {
  access_token: string;
  nonce: string;
  scope: string;
  app_id: string;
  token_type: "Bearer";
  expires_in: number;
};

export type XLink = {
  hash: string;
  creator: User;
  creatorId: string;
  metadata: Metadata | null;
  price: string;
};

export type XPayment = Payment & {
  initiatedAt: string;
  paidAt: string | null;
};

export type XSalesPayment = XPayment & {
  user: User;
  link: XLink;
};

export type CurrencyAmount = {
  currency_code: string;
  value: string;
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

export type MerchantIntegrationResponse = HateoasResponse & {
  merchant_id: string;
  tracking_id: string;
  given_name?: string;
  surname?: string;
  products: any[];
  payments_receivable: boolean;
  primary_email?: string;
  primary_email_confirmed?: boolean;
  oauth_integrations: any[];
  primary_currency: string;
  country?: string;
};

export type OrderDetailsResponse = HateoasResponse & {
  id: string;
  intent: "CAPTURE";
  status: string;
  update_time: string;
  payer: {
    email_address: string;
    name: PaypalNameObject;
    payer_id: string;
  };
  purchase_units: Array<{
    description: string;
    reference_id;
    amount: CurrencyAmount & {
      breakdown: Record<
        string,
        {
          currency_code: string;
          value: string;
        }
      >;
    };
    payments: {
      captures: Array<
        HateoasResponse & {
          id: string;
          create_time: string;
          disbursement_mode: string;
          final_capture: boolean;
          amount: CurrencyAmount;
          seller_receivable_breakdown: {
            gross_amount: CurrencyAmount;
            net_amount: CurrencyAmount;
            paypal_fee: CurrencyAmount;
            platform_fees: Array<{
              amount: CurrencyAmount;
              payee: {
                merchantId: string;
              };
            }>;
          };
        }
      >;
    };
  }>;
};
