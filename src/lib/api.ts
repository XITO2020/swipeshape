import axios from 'axios';

// Create a base axios instance with default settings
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    // Vérifier si on est côté client avant d'accéder à localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Importer le router singleton de Next.js
import Router from 'next/router';

// Response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    // Redirect to login if unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        // S'assurer qu'on est côté client avant d'accéder à localStorage
        window.localStorage.removeItem('token');
        // Utiliser Router.push au lieu de window.location.href pour les redirections
        const callbackUrl = encodeURIComponent(window.location.pathname);
        // Naviguer de façon sécurisée
        if (Router && typeof Router.push === 'function') {
          Router.push(`/login?callbackUrl=${callbackUrl}`);
        } else {
          // Fallback si le router n'est pas disponible
          window.location.href = `/login?callbackUrl=${callbackUrl}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// ===== API CENTRALISÉE POUR LES DONNÉES =====

/**
 * Types de base pour les réponses API
 */
interface ApiResponse<T> {
  data: T | null;
  error: any | null;
}

/**
 * Récupération des programmes
 */
export async function getPrograms(): Promise<ApiResponse<any[]>> {
  try {
    const response = await api.get('/api/programs');
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Erreur API getPrograms:', error);
    return { data: null, error };
  }
}

/**
 * Récupération d'un programme spécifique
 */
export async function getProgram(id: string | number): Promise<ApiResponse<any>> {
  try {
    const response = await api.get(`/api/programs/${id}`);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Erreur API getProgram:', error);
    return { data: null, error };
  }
}

/**
 * Récupération des articles avec filtres optionnels
 */
export async function getArticles(search: string = '', date: string = ''): Promise<ApiResponse<any[]>> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (date) params.append('date', date);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/api/articles${queryString}`);
    
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Erreur API getArticles:', error);
    return { data: null, error };
  }
}

/**
 * Récupération des événements avec filtres optionnels
 */
export async function getEvents(search: string = '', date: string = '', upcoming: boolean = true): Promise<ApiResponse<any[]>> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (date) params.append('date', date);
    params.append('upcoming', upcoming.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/api/events${queryString}`);
    
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Erreur API getEvents:', error);
    return { data: null, error };
  }
}

/**
 * Récupération des commentaires
 */
export async function getComments(articleId?: string | number): Promise<ApiResponse<any[]>> {
  try {
    const queryString = articleId ? `?articleId=${articleId}` : '';
    const response = await api.get(`/api/comments${queryString}`);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Erreur API getComments:', error);
    return { data: null, error };
  }
}

/**
 * Création d'un commentaire
 */
export async function createComment(commentData: any): Promise<ApiResponse<any>> {
  try {
    const response = await api.post('/api/comments', commentData);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Erreur API createComment:', error);
    return { data: null, error };
  }
}

export default api;
