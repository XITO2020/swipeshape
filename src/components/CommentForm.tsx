'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAppStore } from '@/lib/store';
import { AlertCircle, Lock } from 'lucide-react';

interface CommentFormProps {
  articleId: string;
  programId: string; // ID du programme associé à l'article
}

export default function CommentForm({ articleId, programId }: CommentFormProps) {
  const { isAuthenticated, user, purchasedPrograms, hasPurchased: checkPurchaseInStore } = useAppStore();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);
  const [hasUserPurchased, setHasUserPurchased] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  // Vérifier si l'utilisateur a acheté le programme
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!isAuthenticated || !user) return;

      // Vérifier d'abord dans le store Zustand si l'utilisateur a déjà acheté ce programme
      const programIdNum = parseInt(programId);
      if (!isNaN(programIdNum) && checkPurchaseInStore(programIdNum)) {
        setHasUserPurchased(true);
        return;
      }

      setIsCheckingPurchase(true);
      setPurchaseError('');

      try {
        // Sinon, vérifier via l'API
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/user/verify-purchase?programId=${programId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setHasUserPurchased(data.hasPurchased);
        } else {
          setPurchaseError('Impossible de vérifier votre achat. Veuillez réessayer plus tard.');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'achat:', error);
        setPurchaseError('Une erreur est survenue lors de la vérification de votre achat.');
      } finally {
        setIsCheckingPurchase(false);
      }
    };

    checkPurchaseStatus();
  }, [isAuthenticated, user, programId, checkPurchaseInStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    // Get token from localStorage
    const token = localStorage.getItem('token');

    const res = await fetch('/api/article_comments/add', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, articleId, programId }),
    });

    if (res.ok) {
      toast.success('Commentaire ajouté !');
      setContent('');
      router.replace(router.asPath); // refresh
    } else {
      const errorData = await res.json().catch(() => ({}));
      toast.error(errorData.message || 'Erreur lors de l\'envoi du commentaire.');
    }

    setIsSubmitting(false);
  };

  if (isCheckingPurchase) {
    return <p className="text-sm text-gray-600">Vérification de votre achat...</p>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <AlertCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">Vous devez être connecté pour commenter.</p>
        <button
          onClick={() => router.push(`/login?redirect=${router.asPath}`)}
          className="text-sm text-pink-600 hover:text-pink-700 font-medium"
        >
          Se connecter
        </button>
      </div>
    );
  }

  if (purchaseError) {
    return <p className="text-sm text-red-500">{purchaseError}</p>;
  }

  if (!hasUserPurchased) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <Lock className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">Accès restreint aux acheteurs</p>
            <p className="text-xs text-yellow-700 mt-1">
              Seuls les utilisateurs ayant acheté ce programme peuvent commenter.
            </p>
            <button
              onClick={() => router.push(`/programs/${programId}`)}
              className="mt-2 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-full"
            >
              Découvrir ce programme
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <textarea
        className="w-full p-2 border border-gray-300 rounded focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
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
