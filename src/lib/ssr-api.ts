/**
 * Fonctions API sécurisées pour utilisation dans getServerSideProps
 * Ces versions n'utilisent pas les intercepteurs axios qui accèdent à localStorage
 */
import { ApiResponse } from '@/types';

/**
 * Helper pour obtenir l'URL absolue pour les appels API côté serveur
 * Importante pour Next.js SSR qui nécessite des URL absolues
 */
function getAbsoluteUrl(path: string): string {
  // En environnement serveur, nous devons utiliser une URL absolue
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                  (typeof window === 'undefined' ? 'http://localhost:3000' : '');
  
  // S'assurer que nous n'avons pas de double slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Version SSR-safe de getPrograms
 */
export async function ssrGetPrograms(): Promise<ApiResponse<any[]>> {
  try {
    const apiUrl = getAbsoluteUrl('/api/programs');
    console.log('Fetching programs from:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Erreur SSR getPrograms:', error);
    return { data: null, error };
  }
}

/**
 * Version SSR-safe de getArticles
 */
export async function ssrGetArticles(search: string = '', date: string = ''): Promise<ApiResponse<any[]>> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (date) params.append('date', date);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const apiUrl = getAbsoluteUrl(`/api/articles${queryString}`);
    console.log('Fetching articles from:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Erreur SSR getArticles:', error);
    return { data: null, error };
  }
}
