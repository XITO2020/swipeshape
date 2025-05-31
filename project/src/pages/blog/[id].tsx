import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getArticleById } from '../../lib/supabase';
import ArticleRenderer from '../../components/ArticleRenderer';
import CommentForm from '../../components/CommentForm';
import { Article } from '../../types';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await getArticleById(id!);
        setArticle(data);
      } catch (err) {
        setError('Impossible de charger l’article.');
      }
    };

    fetchArticle();
  }, [id]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!article) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <ArticleRenderer content={article.content} />

      <hr className="my-6 border-gray-300" />

      <h2 className="text-2xl font-semibold mb-4">Commentaires</h2>
      <CommentForm articleId={article.id} />
    </div>
  );
};

export default BlogPost;
