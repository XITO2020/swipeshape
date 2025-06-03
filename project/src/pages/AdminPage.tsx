import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, Edit, Trash2, Save, X, Star } from 'lucide-react';
import { useAppStore } from '../lib/store';
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getAllCommentsAdmin,
  updateCommentStatus,
  deleteCommentAdmin as deleteSupabaseCommentAdmin
} from '../lib/supabase';
import { Article, Comment } from '../types';
import ImageUploader from '../components/ImageUploader';

const AdminPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAppStore();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For articles
  const [isEditing, setIsEditing] = useState(false);
  const [relatedArticlesInput, setRelatedArticlesInput] = useState('');

  // Comment State
  const [adminComments, setAdminComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [isCommentActionLoading, setIsCommentActionLoading] = useState(false);

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
      navigate('/login');
      return;
    }

    fetchArticles();
    fetchAdminComments();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchAdminComments = async () => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const { data, error } = await getAllCommentsAdmin();
      if (error) {
        console.error('Error fetching comments for admin:', error);
        throw error;
      }
      setAdminComments(data || []);
    } catch (err: any) {
      console.error('Detailed error fetching admin comments:', err);
      setCommentsError(err.message || 'Failed to fetch comments. Check console for details.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleApproveComment = async (commentId: number) => {
    setIsCommentActionLoading(true);
    setCommentsError(null);
    try {
      const { error } = await updateCommentStatus(commentId, 'approved');
      if (error) throw error;
      await fetchAdminComments(); // Refresh list
    } catch (err: any) {
      console.error('Error approving comment:', err);
      setCommentsError(err.message || 'Failed to approve comment');
    } finally {
      setIsCommentActionLoading(false);
    }
  };

  const handleRejectComment = async (commentId: number) => {
    setIsCommentActionLoading(true);
    setCommentsError(null);
    try {
      const { error } = await updateCommentStatus(commentId, 'rejected');
      if (error) throw error;
      await fetchAdminComments(); // Refresh list
    } catch (err: any) {
      console.error('Error rejecting comment:', err);
      setCommentsError(err.message || 'Failed to reject comment');
    } finally {
      setIsCommentActionLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this comment?")) {
      return;
    }
    setIsCommentActionLoading(true);
    setCommentsError(null);
    try {
      const { error } = await deleteSupabaseCommentAdmin(commentId);
      if (error) throw error;
      await fetchAdminComments(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setCommentsError(err.message || 'Failed to delete comment');
    } finally {
      setIsCommentActionLoading(false);
    }
  };

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
    // related_articles is handled by relatedArticlesInput and setRelatedArticlesInput
    if (name === 'related_articles_input') {
      setRelatedArticlesInput(value);
    } else {
      setCurrentArticle({ ...currentArticle, [name]: value });
    }
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
    setRelatedArticlesInput('');
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentArticle.title || !currentArticle.content || !currentArticle.author) {
      alert('Please fill in all required fields');
      return;
    }

    const related_articles_array = relatedArticlesInput
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id) && id !== 0);

    const articleData = {
      ...currentArticle,
      related_articles: related_articles_array
    };
    
    try {
      if (articleData.id) {
        // Update existing article
        // Ensure we don't pass undefined fields that Partial<Article> might have if not set by form
        const updateData: Partial<Article> = { ...articleData };
        if (updateData.image_url === '') delete updateData.image_url; // Example: Supabase might error on empty string for URL if it expects null or valid URL
        if (updateData.tiktok_url === '') delete updateData.tiktok_url;
        if (updateData.instagram_url === '') delete updateData.instagram_url;

        await updateArticle(articleData.id, updateData);
      } else {
        // Create new article
        await createArticle(articleData as Omit<Article, 'id' | 'created_at' | 'updated_at'>);
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
    setRelatedArticlesInput(article.related_articles ? article.related_articles.join(', ') : '');
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
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-purple-800 mb-10">Admin Dashboard</h1> {/* Increased mb */}
        
        {/* Article Management Section Wrapper */}
        <div className="bg-slate-50 rounded-xl shadow-lg p-6 sm:p-8 mb-12">
          <h2 className="text-2xl font-bold text-purple-800 mb-8">Article Management</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Article Editor Card - maintain its existing style for card-in-card */}
              <div className="bg-white rounded-xl shadow-md p-6"> {/* Removed mb-8 as parent has mb now */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-purple-700"> {/* Changed to H3 for hierarchy */}
                    {currentArticle.id ? 'Edit Article' : 'Create New Article'}
                  </h3>
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
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titre *</label> {/* Adjusted label style */}
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
                  <label htmlFor="related_articles_input" className="block text-sm font-medium text-gray-700 mb-1">Related Articles (IDs, comma-separated)</label> {/* Adjusted label style */}
                  <input
                    type="text"
                    id="related_articles_input"
                    name="related_articles_input"
                    value={relatedArticlesInput}
                    onChange={(e) => setRelatedArticlesInput(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Autrice *</label> {/* Adjusted label style */}
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
                  <label htmlFor="tiktok_url" className="block text-sm font-medium text-gray-700 mb-1">Lien TikTok (embed url)</label> {/* Adjusted label style */}
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
                  <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 mb-1">Instagram Embed URL</label> {/* Adjusted label style */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenu rédactionnel *</label> {/* Adjusted label style */}
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
          
            {/* Article List Card - maintain its existing style */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-purple-700 mb-4">Existing Articles</h3> {/* Changed to H3, made title more descriptive */}

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

        </div> {/* End of Article Management Section Wrapper */}

        {/* Comment Moderation Section */}
        {/* Ensure this section also has a consistent wrapper or styling if needed, though it's already a card */}
        <div className="bg-slate-50 rounded-xl shadow-lg p-6 sm:p-8"> {/* Applied similar wrapper style for consistency */}
          <h2 className="text-2xl font-bold text-purple-800 mb-8">Comment Moderation</h2> {/* Matched heading style with Articles section */}
          {commentsLoading && <p className="text-gray-500">Loading comments...</p>}
          {commentsError && !commentsLoading && <p className="text-red-500 mb-4">Error loading comments: {commentsError}</p>}

          {!commentsLoading && !commentsError && adminComments.length === 0 && (
            <p className="text-gray-500">No comments found or available for moderation.</p>
          )}
          {!commentsLoading && !commentsError && adminComments.length > 0 && (
            <div className="space-y-6">
              {adminComments.map((comment) => (
                <div key={comment.id} className="border border-gray-300 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div className="mb-3 sm:mb-0">
                      <p className="font-semibold text-purple-800">{comment.user_email}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                      <div className="flex items-center my-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({comment.rating}/5)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Status: <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                          comment.status === 'approved' ? 'bg-green-100 text-green-700' :
                          comment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{comment.status}</span>
                      </p>
                      {comment.updated_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last Updated: {new Date(comment.updated_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0 self-start sm:self-center">
                      {comment.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveComment(comment.id)}
                          disabled={isCommentActionLoading}
                          className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {comment.status !== 'rejected' && (
                        <button
                          onClick={() => handleRejectComment(comment.id)}
                          disabled={isCommentActionLoading}
                          className="px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isCommentActionLoading}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;