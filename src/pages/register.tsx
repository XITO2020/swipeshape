import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { withPublic } from '../lib/withAuth';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser, setAuthState } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du formulaire
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Afficher l'état de l'inscription
      console.log('Début d\'inscription via API route simplifiée pour:', email);
      
      // SOLUTION ALTERNATIVE: Utiliser notre API route simplifiée spécialement créée
      const response = await fetch('/api/auth/signup-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          userData: { fullName }
        }),
      });
      
      const result = await response.json();
      console.log('Résultat inscription simplifiée:', result);
      
      // Vérifier si une erreur est présente dans la réponse
      if (!response.ok || result.error) {
        let errorMsg = result.error || 'Erreur lors de l\'inscription';
        
        // Messages d'erreur personnalisés selon le type d'erreur
        if (errorMsg.includes('already exists') || errorMsg.includes('already registered')) {
          errorMsg = 'Cet email est déjà utilisé';
        } else if (errorMsg.includes('rate limit')) {
          errorMsg = 'Trop de tentatives. Veuillez réessayer plus tard';
        } else if (errorMsg.includes('password')) {
          errorMsg = 'Mot de passe invalide: minimum 8 caractères requis';
        }
        
        setError(errorMsg);
        console.error('Erreur d\'inscription:', result.error);
      }
      // Si l'inscription a réussi
      else if (result.success && result.user) {
        // Adapter le format de l'utilisateur Supabase au format attendu par l'application
        const formattedUser = {
          id: result.user.id,
          email: result.user.email || '',
          created_at: result.user.created_at || new Date().toISOString(),
          fullName: fullName
        };
        
        // Mettre à jour l'utilisateur et afficher un message de succès
        setUser(formattedUser);
        setError(null); // Effacer toute erreur précédente
        
        // Afficher un message de succès directement dans l'interface
        const successMessage = document.createElement('div');
        successMessage.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4';
        successMessage.innerHTML = '<strong>Félicitations!</strong> Inscription réussie! Redirection vers votre profil...';
        const formElement = document.querySelector('form');
        if (formElement && formElement.parentNode) {
          formElement.parentNode.insertBefore(successMessage, formElement);
        }
        
        console.log('Inscription réussie! Redirection vers la page de profil...');
        
        // Mettre à jour l'état d'authentification global
        try {
          // Si disponible, mettre à jour l'état d'authentification global
          if (setAuthState) {
            setAuthState(true, false); // isAuthenticated = true, isAdmin = false
          }
        } catch (e) {
          console.log('setAuthState n\'est pas disponible, ignorant cette étape');
        }
        
        // Rediriger vers la page de profil après inscription
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      }
    } catch (err: any) {
      // Gérer les exceptions
      console.error('Exception lors de l\'inscription:', err);
      setError(err.message || 'Échec de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64 flex items-center justify-center bg-purple-50 relative">
      <div className="animated-background">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-purple-800 mb-6 text-center">Rejoignez Swipe-Shape</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 mb-2">Nom complet</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Votre nom"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`w-full p-3 rounded-lg font-medium text-white ${
              isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Inscription en cours...' : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-800">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default withPublic(RegisterPage);
