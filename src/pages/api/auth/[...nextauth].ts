import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    EmailProvider({
      from: process.env.GOOGLE_MAIL_CLIENT_USER,

      server: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,

        auth: {
          type: "OAuth2",
          user: process.env.GOOGLE_MAIL_CLIENT_USER,
          serviceClient: process.env.GOOGLE_MAIL_CLIENT_ID,
          privateKey: process.env.GOOGLE_MAIL_CLIENT_KEY,
        },
        logger: true,
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
