import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prismaAdapter } from "../../../modules/api/adapter";
import { emailProvider } from "../../../modules/api/emailProvider";
import { SiweMessage } from "siwe";
import { getCsrfToken } from "next-auth/react";

//https://github.com/spruceid/siwe-next-auth-example/blob/main/pages/api/auth/%5B...nextauth%5D.ts

export default NextAuth({
  adapter: prismaAdapter,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    emailProvider,

    CredentialsProvider({
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
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
          if (siwe.domain !== nextAuthUrl.host) {
            return null;
          }

          if (siwe.nonce !== (await getCsrfToken({ req }))) {
            return null;
          }

          await siwe.validate(credentials?.signature || "");
          return {
            id: siwe.address,
          };
        } catch (e) {
          return null;
        }
      },
    }),

    // CredentialsProvider({
    //   // The name to display on the sign in form (e.g. 'Sign in with...')
    //   name: "Dummy Customer",
    //   credentials: {
    //     email: {
    //       label: "email",
    //       type: "text",
    //       placeholder: "chuck@norris.com",
    //     },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials, req) {
    //     // const res = await fetch("/your/endpoint", {
    //     //   method: 'POST',
    //     //   body: JSON.stringify(credentials),
    //     //   headers: { "Content-Type": "application/json" }
    //     // })
    //     // const user = await res.json()
    //     if (!credentials) return null;

    //     let user = await prisma.user.findUnique({
    //       where: { email: credentials.email },
    //     });
    //     if (user) return user;

    //     user = await prisma.user.create({
    //       data: {
    //         email: credentials.email,
    //       },
    //     });
    //     return user;
    //   },
    // }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.uid;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
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
