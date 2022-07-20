import axios from "axios";
import * as AxiosLogger from "axios-logger";
import {
  ClientCredentials,
  HateoasResponse,
  MerchantIntegrationResponse,
} from "../../types/Payment";
import { adapterClient } from "./adapter";

export function sdk(
  sdkEndpoint: string,
  clientId: string,
  secret: string,
  toMerchantId: string
) {
  const paypalHttp = axios.create({
    baseURL: sdkEndpoint,
  });
  paypalHttp.interceptors.request.use(async (config) => {
    const token = await getBearerToken();
    config.headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token.access_token}`,
    };
    return config;
  });

  paypalHttp.interceptors.request.use(AxiosLogger.requestLogger);

  let token: ClientCredentials;
  const acquireBearerToken = async (): Promise<ClientCredentials> => {
    return (
      await axios({
        method: "POST",
        baseURL: sdkEndpoint,
        url: "/v1/oauth2/token",
        headers: {
          "content-type": "x-www-form-urlencoded",
        },
        auth: {
          username: clientId,
          password: secret,
        },
        data: `grant_type=client_credentials`,
      })
    ).data;
  };

  const getBearerToken = async (): Promise<ClientCredentials> => {
    if (!token) {
      const cachedToken = await adapterClient.clientToken.findFirst({
        where: {
          type: "PAYPAL",
        },
      });

      if (!cachedToken || cachedToken.expires <= new Date()) {
        if (cachedToken) {
          await adapterClient.clientToken.delete({
            where: {
              id: cachedToken.id,
            },
          });
        }
        token = await acquireBearerToken();

        await adapterClient.clientToken.create({
          data: {
            id: token.nonce,
            expires: new Date(Date.now() + token.expires_in * 1000),
            type: "PAYPAL",
            value: token.access_token,
            appId: token.app_id,
          },
        });
      } else {
        token = {
          access_token: cachedToken.value,
          nonce: cachedToken.id,
          token_type: "Bearer",
          app_id: cachedToken.appId,
          expires_in: cachedToken.expires.getTime() - Date.now(),
          scope: "",
        };
      }
    }
    return token;
  };

  return {
    startSigningUpMerchant: async (
      userId: string,
      callbackOnboardedUrl: string
    ): Promise<string | null> => {
      try {
        const resp: HateoasResponse = await (
          await paypalHttp({
            method: "POST",
            url: "/v2/customer/partner-referrals",
            data: {
              tracking_id: userId,
              partner_config_override: {
                return_url: callbackOnboardedUrl,
              },
              operations: [
                {
                  operation: "API_INTEGRATION",
                  api_integration_preference: {
                    rest_api_integration: {
                      integration_method: "PAYPAL",
                      integration_type: "THIRD_PARTY",
                      third_party_details: {
                        features: [
                          "PAYMENT",
                          "PARTNER_FEE",
                          "ACCESS_MERCHANT_INFORMATION",
                        ],
                      },
                    },
                  },
                },
              ],
              products: ["EXPRESS_CHECKOUT"],
              legal_consents: [
                {
                  type: "SHARE_DATA_CONSENT",
                  granted: true,
                },
              ],
            },
          })
        ).data;

        const actionUrl = resp.links.find((l) => l.rel === "action_url");
        return actionUrl?.href || null;
      } catch (e: any) {
        console.error(JSON.stringify(e, null, 2));
        return null;
      }
    },

    getMerchantInfo: async (
      merchantId: string
    ): Promise<MerchantIntegrationResponse> => {
      try {
        const resp: MerchantIntegrationResponse = await (
          await paypalHttp({
            method: "GET",
            url: `/v1/customer/partners/${toMerchantId}/merchant-integrations/${merchantId}`,
          })
        ).data;

        return resp;
      } catch (e: any) {
        console.error(e);
        throw e;
      }
    },

    getOrderInfo: async (orderId: string): Promise<any> => {
      try {
        const order = (
          await paypalHttp({
            method: "GET",
            url: `/v2/checkout/orders/${orderId}`,
          })
        ).data;
        return order;
      } catch (e: any) {
        console.error(e);
        throw e;
      }
    },
  };
}

const paypal = sdk(
  process.env.NEXT_PUBLIC_PAYPAL_SDK_ENDPOINT as string,
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
  process.env.PAYPAL_SECRET as string,
  process.env.PAYPAL_MERCHANT_ID as string
);

export default paypal;
