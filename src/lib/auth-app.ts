import jwt from 'jsonwebtoken';
import { headers, cookies } from 'next/headers';
import { supabase } from './supabase';
import { NextRequest, NextResponse } from 'next/server';

// Type pour les données utilisateur décodées du JWT
export interface DecodedToken {
  userId: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

// Vérifier le JWT token d'un utilisateur depuis l'en-tête Authorization ou les cookies
export const verifyAuthTokenApp = async (): Promise<DecodedToken | null> => {
  try {
    // Récupérer le token depuis l'en-tête Authorization (Bearer token)
    const authHeader = (await headers()).get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : (await cookies()).get('token')?.value;
    
    if (!token) return null;

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'swipeshape_default_secret') as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return null;
  }
};

// Vérifier si l'utilisateur est un administrateur
export const verifyAuthAdminApp = async (): Promise<DecodedToken | null> => {
  const decoded = await verifyAuthTokenApp();
  
  if (!decoded || !decoded.isAdmin) {
    return null;
  }
  
  return decoded;
};

// Générer un JWT token pour un utilisateur
export const generateAuthToken = (userId: string, email: string, isAdmin: boolean): string => {
  // Générer un token JWT qui expire dans 7 jours
  return jwt.sign(
    { userId, email, isAdmin },
    process.env.JWT_SECRET || 'swipeshape_default_secret',
    { expiresIn: '7d' }
  );
};

// Middleware pour l'authentification utilisateur dans App Router
export const requireAuthApp = async (handler: (token: DecodedToken) => Promise<Response>): Promise<Response> => {
  const token = await verifyAuthTokenApp();
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return handler(token);
};

// Middleware pour l'authentification admin dans App Router
export const requireAdminApp = async (handler: (token: DecodedToken) => Promise<Response>): Promise<Response> => {
  const token = await verifyAuthAdminApp();
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Accès administrateur requis' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return handler(token);
};

// Fonction middleware isAdmin pour être utilisée comme middleware avec Next.js App Router
export async function isAdmin(req: NextRequest) {
  try {
    // Récupérer le token depuis l'en-tête Authorization ou les cookies
    const authHeader = req.headers.get('authorization');
    const cookieStore = req.cookies;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'swipeshape_default_secret') as DecodedToken;
    
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 });
    }
    
    // Si l'utilisateur est un administrateur, permettre l'accès
    return NextResponse.next();
  } catch (error) {
    console.error('Erreur lors de la lecture des entêtes', error);
    return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 401 });
  }
};
