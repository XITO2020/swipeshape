import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

/**
 * Retourne une instance Supabase configurée avec les cookies de la requête
 */
export function createSupabaseClient(req: NextRequest) {
  return createServerComponentClient({ cookies });
}