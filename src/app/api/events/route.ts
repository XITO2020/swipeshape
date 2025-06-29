// API Route pour les événements
import { NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db';
import { Event } from '../../../types';
import { throttleApiRequests, withApiMiddleware, handleApiError } from '../../../lib/api-middleware-app';

export async function GET(request: Request) {
  console.log('API events endpoint called with method: GET');
  
  try {
    // Récupérer les paramètres de recherche depuis l'URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const date = searchParams.get('date');
    const upcoming = searchParams.get('upcoming');
    
    console.log('Fetching events with filters:', { search, date, upcoming });
    
    // Construire la requête SQL et les paramètres
    let sqlQuery = 'SELECT * FROM events WHERE 1=1';
    const params: any[] = [];
    
    // Ajouter les filtres si nécessaire
    if (search && search.trim() !== '') {
      // Pour une recherche textuelle
      sqlQuery += ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        // Pour un filtre par date
        const dateStr = date.split('T')[0]; // Format YYYY-MM-DD
        sqlQuery += ` AND event_date >= $${params.length + 1} AND event_date < $${params.length + 2}`;
        params.push(`${dateStr}T00:00:00`);
        params.push(`${dateStr}T23:59:59`);
      }
    }
    
    // Filtre pour les événements à venir
    if (upcoming === 'true') {
      const now = new Date().toISOString();
      sqlQuery += ` AND event_date >= $${params.length + 1}`;
      params.push(now);
    }
    
    // Ordonner les résultats
    sqlQuery += ' ORDER BY event_date ASC';
    
    // Exécuter la requête
    console.log('Executing SQL query:', sqlQuery, 'with params:', params);
    const { data, error } = await executeQuery(sqlQuery, params);
    
    if (error) {
      console.error('Erreur de base de données dans API événements:', error);
      return handleApiError('Erreur lors de la récupération des événements', 500);
    }
    
    console.log(`Successfully fetched ${data?.length || 0} events`);
    return withApiMiddleware(NextResponse.json(data || []));
  } catch (error) {
    console.error('Exception API événements:', error);
    return handleApiError('Erreur serveur lors de la récupération des événements', 500);
  }
}

// Gestion des autres méthodes HTTP
export function OPTIONS() {
  return withApiMiddleware(NextResponse.json({}, { status: 200 }));
}

export function POST() {
  return withApiMiddleware(NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }));
}

export function PUT() {
  return withApiMiddleware(NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }));
}

export function DELETE() {
  return withApiMiddleware(NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }));
}

export function PATCH() {
  return withApiMiddleware(NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }));
}
