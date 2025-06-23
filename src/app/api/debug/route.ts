import { NextResponse } from 'next/server';

// API simple qui ne dépend d'aucune connexion externe
export async function GET() {
  console.log('API de debug appelée avec succès');
  
  // Afficher des informations sur l'environnement
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY_EXISTS: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_SECRET_EXISTS: !!process.env.ADMIN_SECRET,
    JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
  };
  
  return NextResponse.json({
    status: 'ok',
    message: 'API de debug fonctionnelle',
    timestamp: new Date().toISOString(),
    environment: envInfo
  });
}
