import { PrismaClient } from "@prisma/client";
import '../types/prisma';

// Variable permettant de choisir si on utilise PostgreSQL directement ou Supabase
const USE_POSTGRES = process.env.USE_POSTGRES === 'true';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaNamespace.ExtendedPrismaClient | undefined;
}

let prismaClient: PrismaNamespace.ExtendedPrismaClient | null = null;

// Création conditionnelle du client Prisma uniquement si USE_POSTGRES est true
if (USE_POSTGRES) {
  prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  }) as PrismaNamespace.ExtendedPrismaClient;
  
  console.log('Mode PostgreSQL direct activé - Client Prisma initialisé');
} else {
  console.log('Mode Supabase activé - Client Prisma non initialisé');
}

// Export l'instance conditionnelle
export const prisma = (global.prisma || prismaClient) as PrismaNamespace.ExtendedPrismaClient;

// En développement, garde l'instance en mémoire pour éviter les connexions multiples
if (process.env.NODE_ENV !== "production" && USE_POSTGRES) {
  global.prisma = prisma;
}
