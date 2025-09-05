// Analytics logic needs migration to Supabase. Prisma is disabled.

export const logEvent = async ({
  userId,
  type,
  details,
}: {
  userId: string;
  type: 'purchase' | 'view' | 'download';
  details?: string;
}) => {
  // All Prisma logic removed. Migration to Supabase pending.
};
