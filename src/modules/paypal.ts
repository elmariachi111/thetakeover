import axios from "axios";
import * as AxiosLogger from "axios-logger";
import { ClientCredentials, HateoasResponse } from "../types/Payment";

export default function (
  sdkEndpoint: string,
  clientId: string,
  secret: string
) {
  const paypalHttp = axios.create({
    baseURL: sdkEndpoint,
  });
  paypalHttp.interceptors.request.use(AxiosLogger.requestLogger);

  let token: ClientCredentials;

  const getBearerToken = async () => {
    if (!token) {
      token = await (
        await paypalHttp({
          method: "POST",
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
    }

    return token;
  };

  return {
    startSigningUpMerchant: async (
      userId: string,
      callbackOnboardedUrl: string
    ): Promise<string | null> => {
      const token = await getBearerToken();
      //console.log(token);

      try {
        const resp: HateoasResponse = await (
          await paypalHttp({
            method: "POST",
            url: "/v2/customer/partner-referrals",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${token.access_token}`,
            },
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
                        features: ["PAYMENT", "REFUND"],
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
        console.error(e);
        return null;
      }
    },
  };
}