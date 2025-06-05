import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchArticles } from '../lib/supabase';
import ContentFilter from '../components/ContentFilter';
import { Article } from '../types';

const BlogPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async (query: string = '', date: Date | null = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await searchArticles(query, date);
      
      if (error) throw error;
      
      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Une erreur est survenue lors du chargement des articles.');
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Blog</h1>

      <ContentFilter
        onSearch={handleSearch}
        onDateChange={handleDateChange}
        placeholder="Rechercher dans les articles..."
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {articles.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          Aucun article trouvé.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link
              key={article.id}
              to={`/blog/${article.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
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
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;