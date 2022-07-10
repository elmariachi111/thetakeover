import { NextApiRequest } from "next";
import { DefaultUser } from "next-auth";
import { encode } from "next-auth/jwt";
import { Cookie, SessionStore } from "../../lib/cookie";
import canonicalUrl from "./canonicalUrl";

//https://github.com/nextauthjs/next-auth/blob/8d7ba75bca2f8a076ff53d55e1916a157e084b1e/packages/next-auth/src/core/routes/callback.ts

export const loginPayer = async (
  req: NextApiRequest,
  user: DefaultUser
): Promise<Cookie[]> => {
  const secureCookie = canonicalUrl.startsWith("https://");
  const cookieName = secureCookie
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const secret = process.env.NEXTAUTH_SECRET as string;

  const token = {
    name: user.name,
    email: user.email,
    picture: user.image,
    uid: user.id,
    sub: user.id?.toString(),
  };

  const sessionMaxAge = 30 * 60 * 60;
  const newToken = await encode({
    secret,
    token,
    maxAge: sessionMaxAge,
  });

  const cookieExpires = new Date();
  cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1000);

  const cookies: Record<string, string> = req.cookies as any as Record<
    string,
    string
  >;

  const sessionStore = new SessionStore(
    {
      name: cookieName,
      options: {
        secure: secureCookie,
        path: "/",
        sameSite: "lax",
        httpOnly: true,
      },
    },
    { cookies, headers: req.headers },
    console
  );

  const sessionCookies = sessionStore.chunk(newToken, {
    expires: cookieExpires,
  });
  return sessionCookies;
};
