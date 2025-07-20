import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { URL, ANON } from './supabase';

/**
 * Retourne une instance Supabase configurée avec les cookies de la requête
 */
export function createSupabaseClient(req: NextRequest) {
  return createClient(URL, ANON, {
    auth: {
      detectSessionInUrl: false,
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'supabase.auth.token'
    }
  });
}