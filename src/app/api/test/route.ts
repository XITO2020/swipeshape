import { NextResponse } from 'next/server';

export async function GET() {
  // Retourner un objet simple sans base de données
  return NextResponse.json({
    status: 'ok',
    message: 'API de test fonctionnelle',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}

export async function POST() {
  return NextResponse.json({ message: 'Méthode non autorisée' }, { status: 405 });
}
