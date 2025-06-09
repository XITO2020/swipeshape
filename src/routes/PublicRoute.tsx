import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const router = useRouter();
  
  // Effectue une redirection côté client si l'utilisateur est connecté
  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (user) {
    // Retourne null pendant la redirection
    return null;
  }

  return <>{children}</>;
};

export default PublicRoute;
