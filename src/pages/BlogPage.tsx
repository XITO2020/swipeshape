import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Utiliser l'API centralisée avec axios
import { getArticles } from '../lib/api';
import ContentFilter from '../components/ContentFilter';
import { Article } from '../types';
import { useAppStore } from '../lib/store';

const BlogPage: React.FC = () => {
  // Utiliser le store global Zustand au lieu de l'état local pour les articles
  const { articles, setArticles } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async (query: string = '', date: Date | null = null) => {
    setIsLoading(true);
    setError(null);

    try {
      // Vérifier si les variables d'environnement Supabase sont définies
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Variables d\'environnement Supabase manquantes');
        setError('Configuration de la base de données incomplète. Contactez l\'administrateur.');
        return;
      }

      // Utiliser notre nouvelle API locale
      const { data, error } = await getArticles(query, date ? date.toISOString() : '');
      
      if (error) {
        console.error('Erreur Supabase:', error);
        setError(`Erreur lors du chargement des articles: ${typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Erreur inconnue'}`);
        return;
      }
      
      console.log(`Articles récupérés: ${data?.length || 0}`);
      // Stocker dans le store global
      setArticles(data || []);
      // Stocker aussi localement
      if (typeof window !== 'undefined') {
        localStorage.setItem('cachedArticles', JSON.stringify(data || []));
      }
    } catch (err: any) {
      console.error('Error détaillée des articles:', err);
      setError(`Une erreur est survenue: ${err?.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSearch = (query: string) => {
    fetchArticles(query);
  };

  const handleDateChange = (date: Date | null) => {
    fetchArticles('', date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Blog</h1>
      
      {/* Afficher les variables d'environnement en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 p-4 mb-6 rounded-lg text-sm">
          <p>État de la configuration:</p>
          <ul className="list-disc ml-4">
            <li>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Définie' : '❌ Non définie'}</li>
            <li>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Définie' : '❌ Non définie'}</li>
            <li>USE_MOCK_DATA: {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? '⚠️ Oui (données fictives)' : '✅ Non (vraies données)'}</li>
          </ul>
        </div>
      )}

      <ContentFilter
        onSearch={handleSearch}
        onDateChange={handleDateChange}
        placeholder="Rechercher dans les articles..."
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          <p className="font-semibold">Erreur:</p>
          <p>{error}</p>
          <button 
            onClick={() => fetchArticles()}
            className="mt-2 px-4 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {articles.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          Aucun article trouvé.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <Link href={`/blog/${article.slug}`} className="block">
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {new Date(article.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="text-violet-600 text-sm font-medium hover:text-violet-700">
                    Lire la suite →
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;