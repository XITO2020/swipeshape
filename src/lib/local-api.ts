// Service pour récupérer les données via les API routes locales (sans problème CORS)
// Ce fichier remplace l'utilisation directe du client Supabase

/**
 * Récupère tous les programmes
 */
export async function getPrograms() {
  try {
    console.log('Récupération des programmes via API route locale...');
    const response = await fetch('/api/programs');
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${data.length} programmes récupérés via API route`);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des programmes:', error);
    return { data: null, error };
  }
}

/**
 * Récupère tous les articles, avec filtrage optionnel
 */
export async function getArticles(search = '', date = '') {
  try {
    console.log('Récupération des articles via API route locale...');
    
    // Construire l'URL avec paramètres de recherche si nécessaire
    let url = '/api/articles';
    const params = new URLSearchParams();
    
    if (search) params.append('search', search);
    if (date) params.append('date', date);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${data.length} articles récupérés via API route`);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des articles:', error);
    return { data: null, error };
  }
}

/**
 * Récupère tous les événements, avec filtrage optionnel
 */
export async function getEvents(search = '', date = '', upcoming = true) {
  try {
    console.log('Récupération des événements via API route locale...');
    
    // Construire l'URL avec paramètres de recherche si nécessaire
    let url = '/api/events';
    const params = new URLSearchParams();
    
    if (search) params.append('search', search);
    if (date) params.append('date', date);
    if (upcoming !== undefined) params.append('upcoming', upcoming.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${data.length} événements récupérés via API route`);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des événements:', error);
    return { data: null, error };
  }
}
