import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { DefaultAccount, DefaultUser } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { prismaAdapter } from "./adapter";

export const findUserAccount = async (
  prisma: PrismaClient,
  userId: string,
  provider: string
) => {
  return await prisma.account.findFirst({
    where: {
      provider,
      userId,
    },
  });
};

export const findOrCreateAndAttachPaypalAccount = async (
  prisma: PrismaClient,
  userId: string,
  payerId: string
): Promise<DefaultAccount> => {
  const account = await findUserAccount(prisma, userId, "paypal");
  if (account) return account as DefaultAccount;

  const adapter = PrismaAdapter(prisma);
  try {
    const newAccount = await adapter.linkAccount({
      userId,
      provider: "paypal",
      type: "credentials",
      providerAccountId: payerId,
    });
    if (!newAccount)
      throw new Error(
        `couldnt link paypal account for user [${userId}], paypal payer [${payerId}]`
      );
    return newAccount;
  } catch (e: any) {
    console.error(e);
    throw e;
  }
};

export const findOrCreateUser = async (
  prisma: PrismaClient,
  email: string,
  name: string,
  sessionUser?: (DefaultUser & { id: string }) | undefined
): Promise<AdapterUser> => {
  if (sessionUser) {
    const adapterUser = await prismaAdapter.getUser(sessionUser.id);
    if (adapterUser) return adapterUser;
  }

  let user = await prismaAdapter.getUserByEmail(email);
  if (user) return user;

  user = await prismaAdapter.createUser({
    emailVerified: new Date(),
    email,
    name,
  });

  return user;
};
