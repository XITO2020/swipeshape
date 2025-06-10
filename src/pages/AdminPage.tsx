import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { getArticles, createArticle, updateArticle, deleteArticle } from '../lib/supabase';
import { Article } from '../types';
import ImageUploader from '../components/ImageUploader';

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

// Import the CSS only on the client side
const QuillCSS = () => {
  useEffect(() => {
    // This code only runs on the client
    import('react-quill/dist/quill.snow.css');
  }, []);
  return null;
};

const AdminPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAppStore();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({
    title: '',
    content: '',
    author: '',
    image_url: '',
    tiktok_url: '',
    instagram_url: '',
    related_articles: []
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    fetchArticles();
  }, [isAuthenticated, isAdmin, router]);

  const fetchArticles = async () => {
    setIsLoading(true);
    const { data, error } = await getArticles();
    if (error) {
      console.error('Error fetching articles:', error);
    } else {
      setArticles(data || []);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentArticle({ ...currentArticle, [name]: value });
  };

  const handleContentChange = (content: string) => {
    setCurrentArticle({ ...currentArticle, content });
  };

  const handleImageUploaded = (url: string) => {
    setCurrentArticle({ ...currentArticle, image_url: url });
  };

  const resetForm = () => {
    setCurrentArticle({
      title: '',
      content: '',
      author: '',
      image_url: '',
      tiktok_url: '',
      instagram_url: '',
      related_articles: []
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentArticle.title || !currentArticle.content || !currentArticle.author) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      if (currentArticle.id) {
        // Update existing article
        await updateArticle(currentArticle.id, currentArticle);
      } else {
        // Create new article
        await createArticle(currentArticle as Omit<Article, 'id' | 'created_at' | 'updated_at'>);
      }
      
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article');
    }
  };

  const handleEdit = (article: Article) => {
    setCurrentArticle(article);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }
    
    try {
      await deleteArticle(id);
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <>
      <QuillCSS />
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-purple-700">
                  {currentArticle.id ? 'Edit Article' : 'Create New Article'}
                </h2>
                {isEditing && (
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-gray-700 mb-2">Titre *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={currentArticle.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="author" className="block text-gray-700 mb-2">Autrice *</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={currentArticle.author}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <ImageUploader 
                    onImageUploaded={handleImageUploaded}
                    currentImage={currentArticle.image_url}
                    label="Featured Image"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="tiktok_url" className="block text-gray-700 mb-2">Lien TikTok (embed url)</label>
                  <input
                    type="url"
                    id="tiktok_url"
                    name="tiktok_url"
                    value={currentArticle.tiktok_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="instagram_url" className="block text-gray-700 mb-2">Instagram Embed URL</label>
                  <input
                    type="url"
                    id="instagram_url"
                    name="instagram_url"
                    value={currentArticle.instagram_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Contenu rédactionnel</label>
                  <div className="border border-gray-300 rounded-lg">
                    <ReactQuill
                      theme="snow"
                      value={currentArticle.content}
                      onChange={handleContentChange}
                      modules={modules}
                      className="h-64"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="flex items-center justify-center px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
                >
                  <Save size={18} className="mr-2" />
                  {currentArticle.id ? 'Update Article' : 'Create Article'}
                </button>
              </form>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-purple-700 mb-4">Articles</h2>
              
              {isLoading ? (
                <p className="text-gray-500">News en chargement...</p>
              ) : articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-purple-800">{article.title}</h3>
                          <p className="text-sm text-gray-500">Ecrit par {article.author}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(article)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune article trouvé</p>
              )}
              
              <button
                onClick={resetForm}
                className="flex items-center mt-6 px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium hover:bg-purple-200 transition-colors"
              >
                <Plus size={18} className="mr-1" />
                Nouvel Article
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminPage;