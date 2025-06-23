import { NextResponse } from 'next/server';
import { executeQuery } from '../../db';
import { withApiMiddleware, corsHeaders, handleApiError } from '@/lib/api-middleware-app';

/**
 * Gestion des requêtes GET pour récupérer tous les templates de newsletter
 */
export async function GET() {
  try {
    const { data, error } = await executeQuery(
      'SELECT id, name, subject, content, created_at FROM newsletter_templates ORDER BY created_at DESC',
      []
    );
    
    if (error) {
      console.error('Error fetching templates:', error);
      return handleApiError('Failed to fetch templates', 500);
    }
    
    return withApiMiddleware(NextResponse.json(data || []));
  } catch (error) {
    console.error('Error in templates API:', error);
    return handleApiError('An unexpected error occurred', 500);
  }
}

/**
 * Gestion des requêtes POST pour créer un nouveau template
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, subject, content } = body;
    
    if (!name || !subject || !content) {
      return NextResponse.json({ error: 'Name, subject and content are required' }, { status: 400 });
    }
    
    const { data, error } = await executeQuery(
      'INSERT INTO newsletter_templates (name, subject, content) VALUES ($1, $2, $3) RETURNING id',
      [name, subject, content]
    );
    
    if (error) {
      throw error;
    }
    
    return withApiMiddleware(
      NextResponse.json(
        { message: 'Template created successfully', id: data[0].id }, 
        { status: 201 }
      )
    );
  } catch (error) {
    console.error('Error creating template:', error);
    return handleApiError('Failed to create template', 500);
  }
}

/**
 * Gestion des requêtes DELETE pour supprimer un template
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }
    
    const { error } = await executeQuery(
      'DELETE FROM newsletter_templates WHERE id = $1',
      [id]
    );
    
    if (error) {
      throw error;
    }
    
    return withApiMiddleware(NextResponse.json({ message: 'Template deleted successfully' }));
  } catch (error) {
    console.error('Error deleting template:', error);
    return handleApiError('Failed to delete template', 500);
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
