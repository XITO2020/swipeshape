// src/routes/protectedRoute.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    // Dès que Clerk est chargé, si pas d'user, redirige vers /login
    if (isLoaded && !user) {
      router.replace('/login');
    }
  }, [isLoaded, user, router]);

  // Tant que Clerk n'est pas prêt ou qu'il n'y a pas d'user, on affiche un loader
  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  // Sinon, on rend les enfants protégés
  return <>{children}</>;
};

export default ProtectedRoute;
