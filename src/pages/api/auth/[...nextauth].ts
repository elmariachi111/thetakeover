import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
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
];

export default async function auth(req, res) {
  const providers = [
    ...defaultProviders,
    emailProvider,
    ethereumProvider(req),

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
  ];

  return await NextAuth(req, res, {
    adapter: prismaAdapter,
    providers,
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      jwt: async ({ user, token }) => {
        console.debug("jwt", user, token);
        if (user) {
          token.uid = user.id;
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
      session: async ({ session, token, user }) => {
        if (session?.user) {
          session.user.id = token.uid;
          session.eth = token.eth;
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
