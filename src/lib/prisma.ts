import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import '../types/prisma';

declare global {
  // singleton pour éviter les multiples connexions
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

const prisma = globalPrisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : []
});

if (process.env.NODE_ENV !== 'production') {
  globalPrisma = prisma;
}

export default prisma;