import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { SignIn } from '@clerk/nextjs';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';


// Tell Next.js to render this page on the client side only
export const getServerSideProps = () => ({ props: {} });

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fonction d'authentification traditionnelle par email/mot de passe
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
      }

      // Redirection après connexion réussie
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Connexion</h1>

        {/* Social Login avec Clerk */}
        <SocialAuthButtons mode="signin" />

        {/* Formulaire de connexion traditionnel */}
        <form onSubmit={handleEmailSignIn} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-red-500 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-red-500 text-sm"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="flex justify-between mt-4">
            <a href="/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">
              Mot de passe oublié ?
            </a>
            <a href="/sign-up" className="text-blue-600 hover:text-blue-800 text-sm">
              Pas encore de compte ? S'inscrire
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
