
// src/services/newsletter.service.ts
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Résultat standard d'un service
 */
export interface ServiceResult {
  success: boolean;
  error?: string;
}

/**
 * Abonné à la newsletter
 */
export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  is_active: boolean;
}

/**
 * Récupère les abonnés actifs
 */
export async function getSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('id, email, name, created_at, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur Supabase getSubscribers :', error.message);
    return [];
  }
  return data || [];
}

/**
 * Désactive l'abonnement pour l'email donné
 */
export async function unsubscribeSubscriber(email: string): Promise<ServiceResult> {
  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .update({ is_active: false })
    .eq('email', email)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Erreur Supabase unsubscribe :', error.message);
    return { success: false, error: error.message };
  }
  if (!data) {
    return { success: false, error: 'Abonné non trouvé' };
  }
  return { success: true };
}

/**
 * Ajoute ou réactive un abonné
 */
export async function addSubscriber(email: string, name?: string): Promise<ServiceResult> {
  const payload = { email, name: name || null, is_active: true };
  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .upsert(payload, { onConflict: 'email' });

  if (error) {
    console.error('Erreur Supabase addSubscriber :', error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}
