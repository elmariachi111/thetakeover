import { PrismaClient } from "@prisma/client";

export const findLink = async (prisma: PrismaClient, linkid: string) => {
  return prisma.link.findUnique({
    where: {
      hash: linkid,
    },
    select: {
      hash: true,
      price: true,
      creatorId: true,
      creator: true,
      originUri: true,
      metadata: true,
    },
  });
};
