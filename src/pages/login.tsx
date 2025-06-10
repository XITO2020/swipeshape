import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signIn } from '../lib/supabase';
import { useAppStore } from '../lib/store';
import { withPublic } from '../lib/withAuth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { callbackUrl } = router.query;
  const { setUser, setAuthState } = useAppStore();

  // Get redirect path from query params
  const redirectTo = callbackUrl ? (Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl) : '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Veuillez saisir votre email et mot de passe');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Utilisation de notre nouvelle API route pour éviter CORS
      const { data, error } = await signIn(email, password);

      if (error) {
        throw error;
      }

      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          created_at: data.user.created_at || new Date().toISOString()
        });
        setAuthState(true, email.includes('admin')); // isAdmin si l'email contient 'admin'

        router.push(redirectTo);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Échec de connexion. Veuillez vérifier vos identifiants.');
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
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md z-10">
        <h1 className="text-2xl font-bold text-purple-800 mb-6 text-center">Connectez-vous à Swipe-Shape</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
              placeholder="votre@email.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
              placeholder="••••••••"
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
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Vous n'avez pas de compte ? {' '}
            <Link href="/register" className="text-purple-600 hover:text-purple-800">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default withPublic(LoginPage);
