// validation-schema.ts
import { z } from "zod";
export const emailSchema = z.string().email();
export const purchaseSchema = z.object({
  programId: z.string().uuid(),
  userEmail: emailSchema,
});
// validation-helpers.ts
export function isValidPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}
export function isNotEmptyString(str: string): boolean {
  return str.trim().length > 0;
}
