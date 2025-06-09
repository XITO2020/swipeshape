import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const router = useRouter();
  
  // Effectue une redirection côté client si l'utilisateur n'est pas connecté
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  if (!user) {
    // Retourne null pendant la redirection
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
