import { z } from "zod";

export const emailSchema = z.string().email();

export const purchaseSchema = z.object({
  programId: z.string().uuid(),
  userEmail: emailSchema,
});
