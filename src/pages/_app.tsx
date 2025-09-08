import React, { useState, useEffect } from 'react';
import { AppProps } from 'next/app';
import '../styles/globals.css';  // Import global styles from root
import '../styles/index.css';    // Import additional styles from root
import { useAppStore } from '../lib/store';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ClerkProvider } from '@clerk/nextjs';
import ensureProductionSafety from '../lib/production-checks';
import { checkEnvVars } from '../utils/env-check';

// Check environment variables on client side
if (typeof window !== 'undefined') {
  console.log('Running client-side environment check...');
  // This will only log public env vars on the client
  checkEnvVars();
}

// Check production safety
ensureProductionSafety();

function MyApp({ Component, pageProps }: AppProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setAuthState, setUser } = useAppStore();

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

  const AppContent = () => (
    <div className="bg-violet-300 bg-opacity-10 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col min-h-screen lg:ml-64">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        <div className="flex-grow">
          <Component {...pageProps} />
        </div>
        <div className="z-3">
          <Footer />
        </div>
      </div>
    </div>
  );

  return (
    <ClerkProvider publishableKey={publishableKey || "pk_test_YnJpZWYtbGlnZXItOTkuY2xlcmsuYWNjb3VudHMuZGV2JA"}>
      <AppContent />
    </ClerkProvider>
  );
}

export default MyApp;