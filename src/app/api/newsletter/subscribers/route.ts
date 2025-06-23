import { NextResponse } from 'next/server';
import { executeQuery } from '../../db';
import { withApiMiddleware, corsHeaders, handleApiError } from '@/lib/api-middleware-app';

/**
 * Gestion des requêtes GET pour récupérer tous les abonnés
 */
export async function GET() {
  try {
    const { data, error } = await executeQuery(
      'SELECT id, email, created_at, is_active FROM newsletter_subscribers ORDER BY created_at DESC',
      []
    );
    
    if (error) {
      console.error('Error fetching subscribers:', error);
      return handleApiError('Failed to fetch subscribers', 500);
    }
    
    return withApiMiddleware(NextResponse.json(data));
  } catch (error) {
    console.error('Error in subscribers API:', error);
    return handleApiError('An unexpected error occurred', 500);
  }
}

/**
 * Gestion des requêtes POST pour ajouter un nouvel abonné
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    
    // Vérifier si l'email existe déjà
    const { data: existingSubscriber } = await executeQuery(
      'SELECT id FROM newsletter_subscribers WHERE email = $1',
      [email]
    );
    
    if (existingSubscriber && existingSubscriber.length > 0) {
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 });
    }
    
    // Ajouter le nouvel abonné
    const { data, error } = await executeQuery(
      'INSERT INTO newsletter_subscribers (email, is_active) VALUES ($1, true) RETURNING id',
      [email]
    );
    
    if (error) {
      throw error;
    }
    
    return withApiMiddleware(
      NextResponse.json(
        { message: 'Subscriber added successfully', id: data[0].id }, 
        { status: 201 }
      )
    );
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return handleApiError('Failed to add subscriber', 500);
  }
}

/**
 * Gestion des requêtes DELETE pour supprimer un abonné
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
    }
    
    const { error } = await executeQuery(
      'DELETE FROM newsletter_subscribers WHERE id = $1',
      [id]
    );
    
    if (error) {
      throw error;
    }
    
    return withApiMiddleware(NextResponse.json({ message: 'Subscriber deleted successfully' }));
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return handleApiError('Failed to delete subscriber', 500);
  }
}

/**
 * Gestion des requêtes OPTIONS pour CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders(), status: 200 });
}

/**
 * Gestion des autres méthodes HTTP non supportées
 */
export async function PUT() {
  return withApiMiddleware(NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }));
}

export async function PATCH() {
  return withApiMiddleware(NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }));
}
