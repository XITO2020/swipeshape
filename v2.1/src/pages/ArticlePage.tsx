import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { getArticle } from '../lib/supabase';
import { Article } from '../types';

const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await getArticle(parseInt(id));
        
        if (error) {
          throw error;
        }
        
        setArticle(data);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load the article. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 md:pt-0 md:pl-64 flex items-center justify-center">
        <p className="text-gray-500">News en chargement...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-16 md:pt-0 md:pl-64 flex flex-col items-center justify-center p-6">
        <p className="text-red-500 mb-4">{error || 'Article not found'}</p>
        <Link 
          to="/blog"
          className="flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Retour au Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link 
          to="/blog"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
           Retour au Blog
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">{article.title}</h1>
        
        <div className="flex items-center text-gray-500 mb-6">
          <div className="flex items-center mr-4">
            <User size={16} className="mr-1" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-1" />
            <span>{formatDate(article.created_at)}</span>
          </div>
        </div>
        
        {article.image_url && (
          <div className="mb-8">
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-auto rounded-xl"
            />
          </div>
        )}
        
        {article.tiktok_url && (
          <div className="mb-8 aspect-video">
            <iframe
              src={article.tiktok_url}
              className="w-full h-full"
              allowFullScreen
              title="TikTok video"
            ></iframe>
          </div>
        )}
        
        {article.instagram_url && (
          <div className="mb-8 aspect-square max-w-md mx-auto">
            <iframe
              src={article.instagram_url}
              className="w-full h-full"
              allowFullScreen
              title="Instagram post"
            ></iframe>
          </div>
        )}
        
        <div 
          className="prose prose-purple max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {article.related_articles && article.related_articles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-purple-800 mb-4">Articles en lien</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Related articles would be fetched and displayed here */}
              <p className="text-gray-500">Page des articles en lien a travailler</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;