import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { SignUp } from '@clerk/nextjs';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';


// Tell Next.js to render this page on the client side only
export const getServerSideProps = () => ({ props: {} });

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fonction d'inscription traditionnelle par email/mot de passe
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Redirection après inscription réussie
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Inscription</h1>

        {/* Social Signup avec Clerk */}
        <SocialAuthButtons mode="signup" />

        {/* Formulaire d'inscription traditionnel */}
        <form onSubmit={handleEmailSignUp} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm">Nom</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-red-500 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm">Email</label>
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
            <label htmlFor="password" className="text-sm">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-red-500 text-sm"
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>

          <div className="flex justify-between mt-4">
            <a href="/sign-in" className="text-blue-600 hover:text-blue-800 text-sm">
              Déjà un compte ? Se connecter
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
