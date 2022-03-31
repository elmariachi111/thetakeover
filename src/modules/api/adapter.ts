import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const prismaAdapter = PrismaAdapter(prisma);

export { prismaAdapter };
