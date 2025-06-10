import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { SignIn } from '@clerk/nextjs';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import styles from '../styles/Auth.module.css';

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
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Connexion</h1>

        {/* Social Login avec Clerk */}
        <SocialAuthButtons mode="signin" />

        {/* Formulaire de connexion traditionnel */}
        <form onSubmit={handleEmailSignIn} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>

          {error && <div className={styles.formError}>{error}</div>}

          <button 
            type="submit" 
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className={styles.authLinks}>
            <a href="/forgot-password" className={styles.authLink}>
              Mot de passe oublié ?
            </a>
            <a href="/sign-up" className={styles.authLink}>
              Pas encore de compte ? S'inscrire
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
