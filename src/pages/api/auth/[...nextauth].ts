import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { adapterClient, prismaAdapter } from "../../../modules/api/adapter";
import { emailProvider } from "../../../modules/api/emailProvider";
import { ethereumProvider } from "../../../modules/api/ethereumProvider";

//https://github.com/spruceid/siwe-next-auth-example/blob/main/pages/api/auth/%5B...nextauth%5D.ts

const defaultProviders = [
  GithubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  }),
  DiscordProvider({
    clientId: process.env.DISCORD_APP_ID as string,
    clientSecret: process.env.DISCORD_APP_SECRET as string,
    // authorization:
    //   "https://discord.com/api/oauth2/authorize?scope=identify+email",
  }),
];

export default async function auth(req, res) {
  const providers = [...defaultProviders, emailProvider, ethereumProvider(req)];

  return await NextAuth(req, res, {
    adapter: prismaAdapter,
    providers,
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      jwt: async ({ user, token }) => {
        if (user) {
          token.uid = user.id;
          token.name = user.name;
          const ethAccount = await adapterClient.account.findFirst({
            where: {
              userId: user?.id,
              provider: "ethereum",
            },
          });
          token.eth = ethAccount?.providerAccountId;
        }
        return token;
      },
      session: async ({ session, token }) => {
        if (session.user) {
          session.user.id = token.uid;
          session.user.eth = token.eth;
          session.user.name = token.name;
        }
        return session;
      },
      redirect({ url, baseUrl }) {
        if (url.startsWith(baseUrl)) return url;
        // Allows relative callback URLs
        else if (url.startsWith("/")) return new URL(url, baseUrl).toString();
        return baseUrl;
      },
    },
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/auth/signin",
    },
    // callbacks: {
    //   async signIn({ user, account, profile, email, credentials }) {
    //     console.log(user, account, profile, email, credentials);
    //     return true;
    //   },
    // },
  });
}
