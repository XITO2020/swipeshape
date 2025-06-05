import { PrismaClient } from '@prisma/client'

// Type extensions for Prisma Client using a simpler approach
declare global {
  namespace PrismaNamespace {
    // Use a simpler type definition that doesn't rely on circular references
    type ExtendedPrismaClient = PrismaClient & any
  }
}

export {};
