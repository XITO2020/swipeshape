import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { Article } from '../types';
import ArticleEditor from '../components/ArticleEditor';

const AdminArticlesPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.publicMetadata.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchArticles();
  }, [user, navigate]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditArticle(article);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArticles(articles.filter(article => article.id !== id));
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditArticle(null);
    fetchArticles();
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
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Articles</h1>
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            <Plus size={20} />
            Nouvel Article
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {new Date(article.created_at).toLocaleDateString()}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="p-2 text-gray-600 hover:text-violet-600 transition-colors"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditor && (
        <ArticleEditor
          onClose={handleCloseEditor}
          editArticle={editArticle || undefined}
        />
      )}
    </div>
  );
};

export default AdminArticlesPage;
