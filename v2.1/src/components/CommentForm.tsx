'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAppStore } from '@/lib/store';

interface CommentFormProps {
  articleId: string;
  hasPurchased: boolean;
}

export default function CommentForm({ articleId, hasPurchased }: CommentFormProps) {
  const { isAuthenticated, user } = useAppStore();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    // Get token from localStorage
    const token = localStorage.getItem('token');

    const res = await fetch('/api/comments/add', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, articleId }),
    });

    if (res.ok) {
      toast.success('Commentaire ajouté !');
      setContent('');
      router.replace(router.asPath); // refresh
    } else {
      toast.error('Erreur lors de l’envoi du commentaire.');
    }

    setIsSubmitting(false);
  };

  if (!isAuthenticated || !user) {
    return <p className="text-sm text-gray-600">Connectez-vous pour commenter.</p>;
  }

  if (!hasPurchased) {
    return <p className="text-sm text-gray-600">Vous devez acheter un programme pour commenter.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <textarea
        className="w-full p-2 border border-gray-300 rounded"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="Votre commentaire..."
      />
      <button
        type="submit"
        className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Envoi...' : 'Commenter'}
      </button>
    </form>
  );
}
