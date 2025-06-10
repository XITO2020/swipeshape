import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppStore } from './store';
import { NextComponentType, NextPageContext } from 'next';

// HOC pour protéger les routes nécessitant une authentification
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated } = useAppStore();
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);
    
    useEffect(() => {
      // Simple auth check without isInitialized
      if (!isAuthenticated && router.isReady) {
        router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
      }
      setCheckingAuth(false);
    }, [isAuthenticated, router]);

    // Show loading state during authentication check
    if (checkingAuth) {
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
export const withAdmin = <P extends object>(Component: React.ComponentType<P>) => {
  const AdminComponent = (props: P) => {
    const { isAuthenticated, isAdmin } = useAppStore();
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
      // Check admin privileges
      if (router.isReady && (!isAuthenticated || !isAdmin)) {
        router.push('/login');
      }
      setCheckingAuth(false);
    }, [isAuthenticated, isAdmin, router]);

    if (checkingAuth) {
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
export const withPublic = <P extends object>(Component: React.ComponentType<P>) => {
  const PublicComponent = (props: P) => {
    const { isAuthenticated } = useAppStore();
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
      if (router.isReady && isAuthenticated) {
        router.push('/');
      }
      setCheckingAuth(false);
    }, [isAuthenticated, router]);

    if (checkingAuth) {
      return <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>;
    }
    // Ne rendre le composant que si l'utilisateur n'est pas authentifié
    return !isAuthenticated ? <Component {...props} /> : null;
  };

  return PublicComponent;
};
