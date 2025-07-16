// utils/supabase/client.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

export function createServerClient(req: NextRequest) {
  return createServerComponentClient({ cookies });
}
