import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppStore } from './store';
import { NextComponentType, NextPageContext } from 'next';

// HOC pour protéger les routes nécessitant une authentification
export const withAuth = (Component: NextComponentType) => {
  const AuthenticatedComponent = (props: any) => {
    const { isAuthenticated, isInitialized } = useAppStore();
    const router = useRouter();

    useEffect(() => {
      // Attendre l'initialisation du state d'authentification
      if (isInitialized) {
        if (!isAuthenticated) {
          router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
        }
      }
    }, [isAuthenticated, isInitialized, router]);

    // Afficher un loading state pendant la vérification
    if (!isInitialized) {
      return <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>;
    }

    // Ne rendre le composant que si l'utilisateur est authentifié
    return isAuthenticated ? <Component {...props} /> : null;
  };

  return AuthenticatedComponent;
};

// HOC pour protéger les routes réservées aux administrateurs
export const withAdmin = (Component: NextComponentType) => {
  const AdminComponent = (props: any) => {
    const { isAuthenticated, isAdmin, isInitialized } = useAppStore();
    const router = useRouter();

    useEffect(() => {
      // Attendre l'initialisation du state d'authentification
      if (isInitialized) {
        if (!isAuthenticated) {
          router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
        } else if (!isAdmin) {
          router.push('/'); // Rediriger vers la page d'accueil si l'utilisateur n'est pas admin
        }
      }
    }, [isAuthenticated, isAdmin, isInitialized, router]);

    // Afficher un loading state pendant la vérification
    if (!isInitialized) {
      return <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>;
    }

    // Ne rendre le composant que si l'utilisateur est authentifié et admin
    return (isAuthenticated && isAdmin) ? <Component {...props} /> : null;
  };

  return AdminComponent;
};

// HOC pour les routes publiques (redirection si déjà authentifié)
export const withPublic = (Component: NextComponentType) => {
  const PublicComponent = (props: any) => {
    const { isAuthenticated, isInitialized } = useAppStore();
    const router = useRouter();
    
    useEffect(() => {
      if (isInitialized && isAuthenticated) {
        // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
        router.push('/');
      }
    }, [isAuthenticated, isInitialized, router]);

    // Ne rendre le composant que si l'utilisateur n'est pas authentifié
    return (!isAuthenticated || !isInitialized) ? <Component {...props} /> : null;
  };

  return PublicComponent;
};
