// src/pages/api/admin/email-templates/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Types d'emails que nous supportons
export const EMAIL_TYPES = {
  WELCOME: 'welcome',
  INVOICE: 'invoice',
  PROGRAM_DELIVERY: 'program_delivery',
  SUBSCRIPTION_END: 'subscription_end',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérification des permissions admin
    const user = await requireAdmin(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      // Récupérer tous les templates d'emails
      const { data, error } = await supabase
        .from('email_templates')
        .select('*');

      if (error) throw error;
      
      return res.status(200).json(data);
    } 
    else if (req.method === 'POST') {
      // Créer un nouveau template
      const { name, subject, content, type } = req.body;
      
      if (!name || !subject || !content || !type) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
      }

      // Vérifier si un template de ce type existe déjà
      const { data: existingTemplate } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', type)
        .single();

      if (existingTemplate) {
        // Mettre à jour le template existant
        const { data, error } = await supabase
          .from('email_templates')
          .update({ name, subject, content, updated_at: new Date() })
          .eq('id', existingTemplate.id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      } else {
        // Créer un nouveau template
        const { data, error } = await supabase
          .from('email_templates')
          .insert([{ name, subject, content, type, created_at: new Date(), updated_at: new Date() }])
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json(data);
      }
    } 
    else if (req.method === 'PUT') {
      // Mettre à jour un template existant
      const { id, name, subject, content } = req.body;
      
      if (!id || !name || !subject || !content) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
      }

      const { data, error } = await supabase
        .from('email_templates')
        .update({ name, subject, content, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } 
    else {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error: any) {
    console.error('Erreur templates d\'email:', error);
    return res.status(500).json({ error: error.message || 'Une erreur est survenue' });
  }
}
