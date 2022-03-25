import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { DefaultAccount, DefaultUser } from "next-auth";

export const findOrCreateAndAttachPaypalAccount = async (
  prisma: PrismaClient,
  userId: string,
  payerId: string
): Promise<DefaultAccount> => {
  const account = await prisma.account.findUnique({
    where: {
      userId_provider: {
        provider: "paypal",
        userId,
      },
    },
  });

  if (account) return account as DefaultAccount;

  const adapter = PrismaAdapter(prisma);
  const newAccount = await adapter.linkAccount({
    userId,
    provider: "paypal",
    type: "credentials",
    providerAccountId: payerId,
  });
  if (!newAccount) throw "couldnt link paypal account";
  return newAccount;
};

export const findOrCreateUser = async (
  prisma: PrismaClient,
  email: string,
  name: string,
  sessionUser?: (DefaultUser & { id: string }) | undefined
): Promise<DefaultUser & { id: string }> => {
  if (sessionUser) {
    return sessionUser;
  }

  const adapter = PrismaAdapter(prisma);
  let user = await adapter.getUserByEmail(email);

  if (user) return user;

  user = await adapter.createUser({
    email,
    name,
  });

  return user;
};
