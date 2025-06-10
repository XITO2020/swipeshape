import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './SocialAuth.module.css';

// Dynamically import Clerk components to avoid SSR issues
const SignInButton = dynamic(() => import('@clerk/nextjs').then(mod => mod.SignInButton), {
  ssr: false,
});

interface SocialAuthButtonsProps {
  mode?: 'signin' | 'signup';
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ mode = 'signin' }) => {
  return (
    <div className={styles.socialAuthContainer}>
      <h3 className={styles.socialAuthTitle}>
        {mode === 'signin' ? 'Se connecter avec' : 'S\'inscrire avec'}
      </h3>
      
      <div className={styles.socialButtonsContainer}>
        {/* Utilisation correcte de Clerk SignInButton avec strategy */}
        <SignInButton mode="modal">
          {/* data-provider est l'attribut correct pour le bouton à l'intérieur */}
          <button 
            className={`${styles.socialButton} ${styles.google}`}
            data-provider="google"
          >
            <img 
              src="/images/google-logo.svg" 
              alt="Google" 
              className={styles.socialIcon} 
            />
            Google
          </button>
        </SignInButton>
        
        <SignInButton mode="modal">
          <button 
            className={`${styles.socialButton} ${styles.instagram}`}
            data-provider="oauth_instagram"
          >
            <img 
              src="/images/instagram-logo.svg" 
              alt="Instagram" 
              className={styles.socialIcon} 
            />
            Instagram
          </button>
        </SignInButton>
        
        <SignInButton mode="modal">
          <button 
            className={`${styles.socialButton} ${styles.tiktok}`}
            data-provider="oauth_tiktok"
          >
            <img 
              src="/images/tiktok-logo.svg" 
              alt="TikTok" 
              className={styles.socialIcon} 
            />
            TikTok
          </button>
        </SignInButton>
      </div>
      
      <div className={styles.separatorContainer}>
        <div className={styles.separator}></div>
        <span className={styles.separatorText}>ou</span>
        <div className={styles.separator}></div>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
