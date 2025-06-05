import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getArticle } from '@/lib/supabase';
import ArticleRenderer from '@/components/ArticleRenderer';
import CommentForm from '@/components/CommentForm';
import { Article } from '@/types';
import { useAppStore } from '@/lib/store';
import axios from 'axios';

const BlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAppStore();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (id) {
        try {
          const { data, error } = await getArticle(Number(id));
          if (error) throw error;
          setArticle(data);
        } catch (err) {
          setError('Impossible de charger l\'article.');
          console.error(err);
        }
      }
    };

    const checkPurchaseStatus = async () => {
      if (isAuthenticated && user) {
        try {
          // Get token for API request
          const token = localStorage.getItem('token');
          
          // Call an API endpoint to check if user has purchased any program
          const response = await axios.get('/api/user/purchases', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          // Check if user has any purchases
          setHasPurchased(response.data.purchases && response.data.purchases.length > 0);
        } catch (err) {
          console.error('Failed to check purchase status', err);
          // Fallback to true for now
          setHasPurchased(true);
        }
      }
    };

    fetchArticle();
    if (isAuthenticated) checkPurchaseStatus();
  }, [id, isAuthenticated, user]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!article) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <ArticleRenderer content={article.content} />

      <hr className="my-6 border-gray-300" />

      <h2 className="text-2xl font-semibold mb-4">Commentaires</h2>
      <CommentForm articleId={String(article.id)} hasPurchased={hasPurchased} />
    </div>
  );
};

export default BlogPost;
