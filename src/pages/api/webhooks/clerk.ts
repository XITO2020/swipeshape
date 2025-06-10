import { NextApiRequest, NextApiResponse } from 'next';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Cette fonction gère les webhooks Clerk pour synchroniser les utilisateurs
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier si c'est une méthode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  // Récupérer la signature SVIX du header
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  // Si les headers ne sont pas présents, erreur
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Headers Svix manquants');
    return res.status(400).json({ success: false, error: 'Headers Svix manquants' });
  }

  // Récupérer le corps de la requête
  const payload = req.body;
  const body = JSON.stringify(req.body);

  // Créer un nouvel objet WebHook de Svix pour vérifier la signature
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';
  let event: WebhookEvent;

  try {
    const webhook = new Webhook(webhookSecret);
    event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    console.error('Erreur de vérification webhook:', error);
    return res.status(400).json({ success: false, error: 'Signature de webhook invalide' });
  }

  // Traiter l'événement selon son type
  switch (event.type) {
    case 'user.created':
    case 'user.updated':
      await handleUserEvent(event.data);
      break;
    case 'session.created':
      // Vous pouvez ajouter une logique pour suivre les sessions
      break;
    case 'session.ended':
      // Vous pouvez ajouter une logique pour nettoyer les sessions
      break;
    // Ajoutez d'autres gestionnaires d'événements selon vos besoins
  }

  // Renvoyer une confirmation à Clerk
  return res.status(200).json({ success: true });
}

// Fonction pour gérer les événements d'utilisateur Clerk
async function handleUserEvent(userData: any): Promise<void> {
  try {
    const email = userData.email_addresses?.[0]?.email_address;
    if (!email) {
      console.error('Aucune adresse email trouvée dans les données utilisateur Clerk');
      return;
    }

    // Vérifier si l'utilisateur existe déjà dans la base de données
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      // Mettre à jour les informations utilisateur
      await supabase
        .from('users')
        .update({
          clerk_id: userData.id,
          first_name: userData.first_name || existingUser.first_name,
          last_name: userData.last_name || existingUser.last_name,
          avatar_url: userData.image_url || existingUser.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);
    } else {
      // Créer un nouvel utilisateur
      await supabase
        .from('users')
        .insert({
          email: email,
          clerk_id: userData.id,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          avatar_url: userData.image_url || '',
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de l\'événement utilisateur:', error);
  }
}
