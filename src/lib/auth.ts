// src/lib/auth.ts
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

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
