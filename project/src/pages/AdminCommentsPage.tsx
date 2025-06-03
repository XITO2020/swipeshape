import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '../../types';
import { getComments, adminDeleteComment } from '../../lib/supabase';
import CommentList from '../../components/admin/CommentList';

const AdminCommentsPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getComments();
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      setComments(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error("Failed to fetch comments:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    setError(null);
    try {
      const { error: deleteError } = await adminDeleteComment(commentId);
      if (deleteError) {
        throw new Error(deleteError.message);
      }
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      alert('Comment deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to delete comment: ${errorMessage}`);
      alert(`Failed to delete comment: ${errorMessage}`);
      console.error("Failed to delete comment:", errorMessage);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4"><p>Loading comments...</p></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Comments</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>}

      <CommentList comments={comments} onDelete={handleDeleteComment} />
    </div>
  );
};

export default AdminCommentsPage;
