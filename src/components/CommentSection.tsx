import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { getComments, createComment, checkUserCanComment } from '../lib/supabase';
import { Comment } from '../types';
import AvatarUploader from './AvatarUploader';

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [canComment, setCanComment] = useState(false);
  const { isAuthenticated, user, updateUserAvatar } = useAppStore();

  useEffect(() => {
    fetchComments();
    if (isAuthenticated && user) {
      checkCommentPermission();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  const checkCommentPermission = async () => {
    if (!user) return;
    
    try {
      const { canComment: hasPermission, error } = await checkUserCanComment(user.id);
      if (error) throw error;
      setCanComment(hasPermission);
    } catch (err) {
      console.error('Error checking comment permission:', err);
      setError('Impossible de vérifier les permissions de commentaire');
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      console.log('CommentSection: Fetching comments from API endpoint');
      
      // Déterminer l'URL correcte du serveur actuel
      // Cette méthode utilise la fenêtre actuelle pour obtenir l'hôte et le protocole
      const serverUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
      const commentsUrl = `${serverUrl}/api/comments`;
      
      console.log('Fetching comments with URL:', commentsUrl);
      const response = await fetch(commentsUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('CommentSection: Received comments data:', { count: data?.length });
      
      setComments(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Impossible de charger les commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('You must be logged in to leave a comment');
      return;
    }
    
    if (!canComment) {
      setError('Only customers who have purchased programs can leave comments');
      return;
    }
    
    if (!content) {
      setError('Please enter a comment');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error } = await createComment({
        user_id: user.id,
        user_email: user.email,
        content,
        rating,
        avatar_url: avatarUrl
      });
      
      if (error) {
        throw error;
      }
      
      setContent('');
      setRating(5);
      fetchComments();
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('There was an error submitting your comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUploaded = (url: string) => {
    setAvatarUrl(url);
    updateUserAvatar(url);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 z-4 bg-transparent">
      <h2 className="text-2xl font-bold mb-6 text-gradient-deux">Avis de la communauté</h2>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Chargement des commentaires...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchComments}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Réessayer
          </button>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Aucun commentaire sur cet article pour le moment.</p>
          {isAuthenticated && canComment && (
            <p className="mt-2 text-purple-600">Sois la première à partager ton expérience !</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 mr-3 flex items-center justify-center">
                    {comment.avatar_url ? (
                      <img 
                        src={comment.avatar_url} 
                        alt={comment.user_email.split('@')[0]} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-purple-500 font-bold">
                        {comment.user_email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-purple-700">{comment.user_email.split('@')[0]}</p>
                    <div className="flex mt-1">
                      {renderStars(comment.rating)}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-purple-800 mb-4">Partage Ton Experience</h3>
        
        {!isAuthenticated ? (
          <div className="mb-4 p-3 bg-stone-200 text-[#415131] rounded-lg transition-all duration-300">
            SVP <a href="/login" className="underline font-medium">connecte-toi</a> pour laisser un commentaire
          </div>
        ) : !canComment ? (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
            Seuls les clients ayant acheté un programme peuvent laisser un commentaire. 
            <a href="/programs" className="underline font-medium ml-1">Découvre nos programmes</a>
          </div>
        ) : null}
        
        <form onSubmit={handleSubmit}>
          {isAuthenticated && canComment && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Ton Avatar</label>
              <AvatarUploader 
                onAvatarUploaded={handleAvatarUploaded}
                currentAvatar={user?.avatar_url}
                size="md"
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">La note que tu veux laisser</label>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!isAuthenticated || !canComment}
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none disabled:opacity-50"
                >
                  <Star
                    size={24}
                    className={i < rating ? 'text-[#1CFD89] fill-[#1CFD89]' : 'text-stone-200'}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="comment" className="block text-gray-700 mb-2">Ton com :</label>
            <textarea
              id="comment"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!isAuthenticated || !canComment}
              placeholder="Share your thoughts about our programs..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              rows={4}
            ></textarea>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={!isAuthenticated || !canComment || isSubmitting}
            className="px-6 py-2 rounded-full font-medium bg-[#b8b3ae] text-pink-50 hover:bg-[#9b899b] hover:text-pink-100 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;