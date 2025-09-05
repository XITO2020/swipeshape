// src/lib/auth.ts
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

import { URL, ANON } from './supabase'

/**
 * Retourne une instance Supabase configurée avec les cookies de la requête
 */
export function createSupabaseClient() {
  return createClient(URL, ANON, {
    auth: {
      detectSessionInUrl: false,
      autoRefreshToken: true,
      persistSession: true,
      // Supabase utilisera automatiquement les cookies de Next.js
      // pas besoin de storageKey ici si vous utilisez seulement le serveur
    }
  })
}
