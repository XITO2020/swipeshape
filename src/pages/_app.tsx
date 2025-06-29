import React, { useState, useEffect } from 'react';
import { AppProps } from 'next/app';
import '../index.css';
import { useAppStore } from '../lib/store';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Importer ClerkProvider directement
import { ClerkProvider } from '@clerk/nextjs';

// Importer les vérifications de sécurité pour la production
import ensureProductionSafety from '@/lib/production-checks';

// Exécuter les vérifications de sécurité au démarrage
ensureProductionSafety();

function MyApp({ Component, pageProps }: AppProps) {
  // Récupérer la clé Clerk depuis les variables d'environnement
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setAuthState, setUser } = useAppStore();
  
  // Vérifier l'authentification au chargement de l'app
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/user/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setAuthState(true, userData.isAdmin || false);
            setUser(userData);
          } else {
            // Token invalide
            localStorage.removeItem('token');
            setAuthState(false, false);
          }
        } catch (error) {
          console.error('Erreur de vérification d\'authentification', error);
          setAuthState(false, false);
        }
      } else {
        setAuthState(false, false);
      }
    };
    
    checkAuth();
  }, [setAuthState, setUser]);

  // Create the app content
  const AppContent = () => (
    <div className="bg-violet-300 bg-opacity-10 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-col min-h-screen lg:ml-64">
        {/* Header */}
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        
        {/* Page content */}
        <div className="flex-grow">
          <Component {...pageProps} />
        </div>
        
        {/* Footer */}
        <div className="z-3">
          <Footer />
        </div>
      </div>
    </div>
  );

  // Only use ClerkProvider if we have a publishable key, otherwise render without it
  return (
    <ClerkProvider publishableKey={publishableKey || "pk_test_YnJpZWYtbGlnZXItOTkuY2xlcmsuYWNjb3VudHMuZGV2JA"}>
      <AppContent />
    </ClerkProvider>
  );
}

export default MyApp;
