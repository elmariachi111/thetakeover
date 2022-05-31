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
        //throws when invalid
        const message = await siwe.validate(credentials?.signature || "");

        const session = await getSession({ req });

        if (session?.user) {
          console.debug(`session user ${session.user.id}`);
          const account = await adapterClient.account.findFirst({
            where: {
              providerAccountId: siwe.address,
              provider: "ethereum",
            },
          });

          if (account) {
            console.debug(
              `eth account exists [${account?.providerAccountId}][${account?.id}]`
            );
            if (account.userId !== session.user.id) {
              //#57 assuming it's *not* safe to move over this account since signing with an Eth address is a safe op
              //console.error("account already taken");
              throw new Error(
                `eth account [${siwe.address}] already associated with another user`
              );
              //#57 alternatively: move the account to the current user.
              // console.warn(
              //   `ethereum address [${siwe.address} is already attached to another user [${account.userId}]. Moving it to the current user`
              // );
              // await adapterClient.account.update({
              //   where: {
              //     id: account.id,
              //   },
              //   data: {
              //     userId: session.user.id,
              //   },
              // });
            }
          } else {
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
            console.debug(
              `Found user [${user.id}] by eth account [${siwe.address}]`
            );
            return user;
          }
          console.debug(`creating new user for eth account [${siwe.address}]`);
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
        throw e;
      }
    },
  });
};
