import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';


// Dynamically import Clerk components to avoid SSR issues
const SignInButton = dynamic(() => import('@clerk/nextjs').then(mod => mod.SignInButton), {
  ssr: false,
});

interface SocialAuthButtonsProps {
  mode?: 'signin' | 'signup';
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ mode = 'signin' }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        {mode === 'signin' ? 'Se connecter avec' : 'S\'inscrire avec'}
      </h3>
      
      <div className="space-y-3">
        {/* Utilisation correcte de Clerk SignInButton avec strategy */}
        <SignInButton mode="modal">
          {/* data-provider est l'attribut correct pour le bouton à l'intérieur */}
          <button 
            className="w-full bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 px-4 py-2"
            data-provider="google"
          >
            <img 
              src="/images/google-logo.svg" 
              alt="Google" 
              className="w-5 h-5" 
            />
            Google
          </button>
        </SignInButton>
        
        <SignInButton mode="modal">
          <button 
            className="w-full bg-white border border-gray-300 rounded-lg hover:border-pink-500 transition-colors flex items-center justify-center gap-2 px-4 py-2"
            data-provider="oauth_instagram"
          >
            <img 
              src="/images/instagram-logo.svg" 
              alt="Instagram" 
              className="w-5 h-5" 
            />
            Instagram
          </button>
        </SignInButton>
        
        <SignInButton mode="modal">
          <button 
            className="w-full bg-white border border-gray-300 rounded-lg hover:border-red-500 transition-colors flex items-center justify-center gap-2 px-4 py-2"
            data-provider="oauth_tiktok"
          >
            <img 
              src="/images/tiktok-logo.svg" 
              alt="TikTok" 
              className="w-5 h-5" 
            />
            TikTok
          </button>
        </SignInButton>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="text-gray-500">ou</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
