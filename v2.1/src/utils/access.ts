import { Purchase } from '@prisma/client';

export const userHasPurchased = (email: string, purchases: Purchase[], programId: string): boolean =>
  purchases.some(p => p.userEmail === email && p.programId === programId);
