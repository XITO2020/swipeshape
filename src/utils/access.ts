// Define Purchase type based on Supabase schema if needed
// type Purchase = { ... }
export type Purchase = {
  id: string;
  programId: string;
  userEmail: string;
  createdAt: string;
};

export const userHasPurchased = (
  email: string, 
  purchases: Purchase[], 
  programId: string
): boolean =>
  purchases.some(
    p => p.userEmail === email && 
    p.programId === programId
  );
