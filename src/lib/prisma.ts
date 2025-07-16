import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import '../types/prisma';

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

// Configuration options for Prisma client
const prismaOptions = {
  log: process.env.NODE_ENV === 'production'
    ? ['error', 'warn'] as const
    : ['query', 'error', 'warn'] as const,
  datasources: { db: { url: process.env.DATABASE_URL } }
};

// Global singleton to avoid multiple instances in development
const globalForPrisma = globalThis as unknown as { globalPrisma?: PrismaClient };

// Create or reuse Prisma client
const prisma: PrismaClient = globalForPrisma.globalPrisma ?? new PrismaClient(prismaOptions);

// Persist client in global namespace in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.globalPrisma = prisma;
}

export { prisma };
export default prisma;