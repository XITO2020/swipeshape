import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

/**
 * Gestion des webhooks Clerk pour synchroniser les utilisateurs
 */
export async function POST(request: Request) {
  try {
    // Récupérer la signature SVIX du header
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    // Si les headers ne sont pas présents, erreur
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Headers Svix manquants');
      return NextResponse.json({ success: false, error: 'Headers Svix manquants' }, { status: 400 });
    }

    // Récupérer le corps de la requête
    const body = await request.text();

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
      return NextResponse.json({ success: false, error: 'Signature de webhook invalide' }, { status: 400 });
    }

    const payload = JSON.parse(body);

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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook Clerk:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

/**
 * Options pour CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

/**
 * Gestion des autres méthodes HTTP non supportées
 */
export function GET() {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}

/**
 * Fonction pour gérer les événements d'utilisateur Clerk
 */
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
