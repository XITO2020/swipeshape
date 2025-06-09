import React, { useState, useEffect } from 'react';
import { AppProps } from 'next/app';
import '../index.css';
import { useAppStore } from '@/lib/store';
import Sidebar from '@/components/SideBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function MyApp({ Component, pageProps }: AppProps) {
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

  return (
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
}

export default MyApp;
