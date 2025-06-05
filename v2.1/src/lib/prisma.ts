import { PrismaClient } from "@prisma/client";
import '../types/prisma';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaNamespace.ExtendedPrismaClient | undefined;
}

// Create Prisma client instance
const prismaClient = new PrismaClient({
  log: ["query"],
});

// Export with proper extended type
export const prisma = (global.prisma || prismaClient) as PrismaNamespace.ExtendedPrismaClient;

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
