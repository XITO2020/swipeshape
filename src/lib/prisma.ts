import { PrismaClient } from "@prisma/client";
import "../types/prisma";

const USE_PRISMA = process.env.USE_POSTGRES === "true";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaNamespace.ExtendedPrismaClient | undefined;
}

let prismaClient: PrismaNamespace.ExtendedPrismaClient | undefined = undefined;

if (USE_PRISMA) {
  prismaClient =
    global.prisma ||
    (new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query"] : [],
    }) as PrismaNamespace.ExtendedPrismaClient);

  if (process.env.NODE_ENV !== "production") {
    global.prisma = prismaClient;
  }

  console.log("✅ Prisma initialisé (PostgreSQL direct)");
} else {
  console.log("⛔ Prisma désactivé (mode Supabase)");
}

export const prisma = prismaClient!;
