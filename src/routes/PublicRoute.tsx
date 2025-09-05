// src/routes/PublicRoute.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    // Si Clerk est chargé et qu'il y a déjà un user, on redirige vers le dashboard
    if (isLoaded && user) {
      router.replace('/dashboard');
    }
  }, [isLoaded, user, router]);

  // Tant que Clerk n'est pas prêt ou que l'utilisateur est authentifié,
  // on affiche un loader (ou null pour ne rien afficher)
  if (!isLoaded || Boolean(user)) {
    return <div>Loading...</div>;
  }

  // Sinon, on rend le composant public (login, signup…)
  return <>{children}</>;
};

export default PublicRoute;
