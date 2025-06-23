/**
 * Plugin Next.js pour exécuter des tâches au démarrage de l'application
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from '@/utils/initApp';

// Variable pour stocker l'état d'initialisation
let isInitialized = false;

export async function middleware(request: NextRequest) {
  // Exécuter l'initialisation une seule fois au démarrage
  if (!isInitialized && process.env.NODE_ENV !== 'development') {
    isInitialized = true;
    await initializeApp();
  }
  
  return NextResponse.next();
}

// Exporter la configuration du plugin
export const config = {
  matcher: ['/api/:path*'],
};
