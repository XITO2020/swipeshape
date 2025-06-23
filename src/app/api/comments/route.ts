import { NextResponse } from 'next/server';
import { executeQuery } from '../db';
import { headers } from 'next/headers';

// Fonction pour définir les headers CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  };
}

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders(), status: 200 });
}

// Gérer les requêtes GET (récupérer les commentaires)
export async function GET(request: Request) {
  console.log('API comments endpoint called with method: GET');
  
  // Récupérer les paramètres de la requête
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('articleId');
  
  try {
    console.log('Fetching comments from database using direct PostgreSQL connection');
    
    let query = 'SELECT * FROM comments WHERE 1=1';
    const params: any[] = [];
    
    // Appliquer le filtre par article si fourni
    if (articleId) {
      query += ' AND article_id = $1';
      params.push(articleId);
    }
    
    // Ajouter le tri par date de création
    query += ' ORDER BY created_at DESC';
    
    // Exécuter la requête via le pool PostgreSQL
    const { data, error } = await executeQuery(query, params);
    
    if (error) {
      console.error('Database error fetching comments:', error);
      return NextResponse.json({ 
        error: 'Erreur lors du chargement des commentaires',
        details: error.message
      }, { headers: corsHeaders(), status: 500 });
    }
    
    console.log(`Returning ${data?.length || 0} comments from database`);
    return NextResponse.json(data || [], { headers: corsHeaders() });
  } catch (error) {
    console.error('Exception in comments API:', error);
    return NextResponse.json({ 
      error: 'Erreur lors du chargement des commentaires',
      details: error instanceof Error ? error.message : String(error)
    }, { headers: corsHeaders(), status: 500 });
  }
}

// Gérer les requêtes POST (créer un commentaire)
export async function POST(request: Request) {
  console.log('API comments endpoint called with method: POST');
  
  try {
    const body = await request.json();
    const { content, user_id, user_email, rating, avatar_url, article_id } = body;
    console.log('Creating new comment:', body);
    
    // Valider les champs requis
    if (!user_email) {
      return NextResponse.json({ error: 'Le champ email est requis' }, 
        { headers: corsHeaders(), status: 400 });
    }
    
    // Construire la requête d'insertion
    const query = `
      INSERT INTO comments 
      (content, user_id, user_email, rating, avatar_url, article_id, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
      RETURNING *
    `;
    
    const params = [
      content || '',
      user_id || null,
      user_email,
      rating || 5,
      avatar_url || null,
      article_id || null
    ];
    
    // Exécuter l'insertion via le pool PostgreSQL
    const { data, error } = await executeQuery(query, params);
    
    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la création du commentaire',
        details: error.message
      }, { headers: corsHeaders(), status: 500 });
    }
    
    const newComment = data?.[0];
    return NextResponse.json(newComment, { headers: corsHeaders(), status: 201 });
  } catch (error) {
    console.error('Exception in POST comments API:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création du commentaire',
      details: error instanceof Error ? error.message : String(error)
    }, { headers: corsHeaders(), status: 500 });
  }
}

// Gérer les autres méthodes HTTP
export async function PUT() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, 
    { headers: corsHeaders(), status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, 
    { headers: corsHeaders(), status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, 
    { headers: corsHeaders(), status: 405 });
}
