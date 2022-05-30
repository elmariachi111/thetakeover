import { NextApiRequest } from "next";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken, getSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { adapterClient, prismaAdapter } from "./adapter";
import canonicalUrl from "./canonicalUrl";

export const ethereumProvider = (req: NextApiRequest) => {
  return CredentialsProvider({
    name: "Ethereum",
    id: "ethereum",
    credentials: {
      message: {
        label: "Message",
        type: "text",
        placeholder: "0x0",
      },
      signature: {
        label: "Signature",
        type: "text",
        placeholder: "0x0",
      },
    },
    async authorize(credentials) {
      try {
        console.debug("siwe, tryign to authorize ", credentials);
        const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));

        if (siwe.domain !== new URL(canonicalUrl).host) {
          return null;
        }

        if (siwe.nonce !== (await getCsrfToken({ req }))) {
          console.error("nonce doesnt match");
          return null;
        }
        await siwe.validate(credentials?.signature || "");

        const session = await getSession({ req });

        if (session?.user) {
          console.debug(`session user ${session.user.id}`);
          const account = await adapterClient.account.findFirst({
            where: {
              userId: session.user.id,
              providerAccountId: siwe.address,
              provider: "ethereum",
            },
          });
          console.debug(`has account ${account?.providerAccountId}`);
          if (!account) {
            console.debug("creating new eth account for session user");
            await prismaAdapter.linkAccount({
              userId: session.user.id,
              type: "credentials",
              provider: "ethereum",
              providerAccountId: siwe.address,
            });
          }
          return session.user;
        } else {
          let user = await adapterClient.user.findFirst({
            where: {
              accounts: {
                some: {
                  provider: "ethereum",
                  providerAccountId: siwe.address,
                },
              },
            },
          });

          if (user) {
            console.debug(`no session. found user by account`);
            return user;
          }
          console.debug("creating user and account");
          user = await adapterClient.user.create({
            data: {
              accounts: {
                create: {
                  type: "credentials",
                  provider: "ethereum",
                  providerAccountId: siwe.address,
                },
              },
            },
          });
          return user;
        }
      } catch (e) {
        console.error("siwe error", e);
        return null;
      }
    },
  });
};
