import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, HelpingHand as Handshake, Contact } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
    <svg width="0" height="0">
              <defs>
                <clipPath id="curveClipDefault" clipPathUnits="objectBoundingBox">
                <path d="M0 0.2 C0.1 0.1, 0.3 0.05, 0.6 0.2, 0.7 -0.4, 1 -0.9 L1 0 L0 0 Z" />
                </clipPath>
                <clipPath id="curveClipSmall" clipPathUnits="objectBoundingBox">
                  <path d="M0 0.1 C0.05 0, 0.15 0.2, 0.3 0.1 V0.2 H0 Z" />
                </clipPath>
                <clipPath id="curveClipMedium" clipPathUnits="objectBoundingBox">
                  <path d="M0 0.15 C0.075 0, 0.225 0.3, 0.45 0.15 V0.3 H0 Z" />
                </clipPath>
                <clipPath id="curveClipLarge" clipPathUnits="objectBoundingBox">
                  <path d="M0 0.25 C0.125 0, 0.375 0.5, 0.75 0.25 V0.5 H0 Z" />
                </clipPath>
                <clipPath id="curveClipXLarge" clipPathUnits="objectBoundingBox">
                  <path d="M0 0.3 C0.15 0, 0.45 0.6, 0.9 0.3 V0.6 H0 Z" />
                </clipPath>
              </defs>
            </svg>
    <div className="curve bg-gradient-to-r from-violet-200 via-pink-200 to-pink-200 w-full"></div>    
    <footer className="bg-gradient-to-r from-violet-200 to-pink-200">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Company Info */}
        <div className="space-y-4">
          <div className="flex justify-center sm:justify-start mt-0 mb-6 md:mb-[64px]">
            <img src="/assets/icons/swsh2.png" alt="SwipeShape" className="relative h-16 sm:h-20 md:h-24 w-auto lg:left-[30px] xl:left-[60px]" />
          </div>
          <div className="space-y-2 text-stone-700">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-violet-600" />
              <p>77 Rue Montesouris, 78440 Gargenville</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-violet-600" />
              <p>+33 1 23 45 67 89</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-violet-600" />
              <p>contact@swipeshape.com</p>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-stone-800">Mentions Légales</h3>
          <ul className="space-y-2 text-stone-700">
            <li>
              <Link href="/rgpd" className="hover:text-violet-700 transition-colors">
                RGPD
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-violet-700 transition-colors">
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-violet-700 transition-colors">
                Conditions d'utilisation
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-stone-800">Notre Société</h3>
          <ul className="space-y-2 text-stone-700">
            <li>
              <Link href="/about" className="hover:text-violet-700 transition-colors">
                <p><Contact size={16} /> À propos de nous </p>
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-violet-700 transition-colors">
                <p><Handshake size={16} /> Contactez-nous </p>
              </Link>
            </li>
            <li>
              <a 
                href="https://tabasco.city" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-violet-700 transition-colors flex items-center gap-1"
              >
                <Globe size={16} /> 
                <br/>
                <p>Webmaster</p>
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-stone-800">Suivez-nous</h3>
          <div className="flex gap-4 justify-center sm:justify-start relative">
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
              <img src="/assets/icons/rou-tk.png" alt="TikTok" className=" h-8 w-8 hover:animate-pulse hover:opacity-80 transition-opacity" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src="/assets/icons/insta.png" alt="Instagram" className=" h-8 w-8 hover:animate-pulse hover:opacity-80 transition-opacity" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <img src="/assets/icons/rou-yt.png" alt="YouTube" className=" h-8 w-8 hover:animate-pulse hover:opacity-80 transition-opacity" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-stone-300">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-stone-600">
          <p> 2025 SwipeShape. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
    </div>

  );
};

export default Footer;
