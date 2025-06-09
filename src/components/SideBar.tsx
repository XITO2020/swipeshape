import React, { useState } from 'react';
import Link from 'next/link';
import { Dumbbell, ShoppingBag, FileText, Calendar, Mail, Home, MessageCircleQuestion } from 'lucide-react';
import { useAppStore } from '../lib/store';

type BackgroundKey = 'home' | 'shop' | 'blog' | 'programs' | 'events' | 'contact' | 'faq';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [hoveredLink, setHoveredLink] = useState<BackgroundKey | null>(null);
  const { isAdmin } = useAppStore();

  const getBackgroundStyle = () => {
    if (!hoveredLink) {
      return 'bg-gradient-to-b from-rose-300 via-yellow-100';
    }

    const backgrounds: Record<BackgroundKey, string> = {
      home: "bg-[url('/assets/images/reelles/flamingo.jpg')]",
      shop: "bg-[url('/assets/images/reelles/fente.jpg')]",
      blog: "bg-[url('/assets/images/reelles/deadweight.jpg')]",
      programs: "bg-[url('/assets/images/reelles/profil.jpg')]",
      events: "bg-[url('/assets/images/reelles/weight.jpg')]",
      contact: "bg-[url('/assets/images/dollarsbeige.jpg')]",
      faq: "bg-[url('/assets/images/reelles/corde.jpg')]"
    };

    return `${backgrounds[hoveredLink]} bg-cover bg-center bg-no-repeat`;
  };

  return (
    <>
        <svg width="0" height="0">
              <defs>
                <clipPath id="curvesDefault" clipPathUnits="objectBoundingBox">
                <path d="M0.8 0 V0.2 C0.9 0.4, 0.7 0.6, 0.8 0.8 H1 Z" />
                </clipPath>
              </defs>
        </svg>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className={` curves h-full ${getBackgroundStyle()} transition-all duration-500`}>
          <div className="p-6">
            {/* Logo */}
            <Link href="/" className="block mb-8" onClick={() => setIsOpen(false)}>
              <img src="/assets/icons/swsh2-flag.png" alt="SwipeShape" className="w-32 mx-auto" />
            </Link>

            {/* Navigation Links */}
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-4 py-2 text-stone-800 hover:text-violet-700 hover:bg-white/20 rounded-lg transition-all duration-200"
                  onMouseEnter={() => setHoveredLink('home')}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => setIsOpen(false)}
                >
                  <Home size={20} />
                  <span>Accueil</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/programs"
                  className="flex items-center space-x-3 px-4 py-2 text-stone-800 hover:text-pink-50 hover:bg-white/20 rounded-lg transition-all duration-200"
                  onMouseEnter={() => setHoveredLink('shop')}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => setIsOpen(false)}
                >
                  <ShoppingBag size={20} />
                  <span>Boutique</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="flex items-center space-x-3 px-4 py-2 text-stone-800 hover:text-pink-50 hover:bg-white/20 rounded-lg transition-all duration-200"
                  onMouseEnter={() => setHoveredLink('blog')}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => setIsOpen(false)}
                >
                  <FileText size={20} />
                  <span>Blog</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tests"
                  className="flex items-center space-x-3 px-4 py-2 text-stone-800 hover:text-pink-50 hover:bg-white/20 rounded-lg transition-all duration-200"
                  onMouseEnter={() => setHoveredLink('programs')}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => setIsOpen(false)}
                >
                  <Dumbbell size={20} />
                  <span>Tests personnels</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="flex items-center space-x-3 px-4 py-2 text-stone-800 hover:text-pink-100 hover:bg-white/20 rounded-lg transition-all duration-200"
                  onMouseEnter={() => setHoveredLink('events')}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => setIsOpen(false)}
                >
                  <Calendar size={20} />
                  <span>Événements</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center space-x-3 px-4 py-2 text-stone-800 hover:text-pink-100 hover:bg-white/20 rounded-lg transition-all duration-200"
                  onMouseEnter={() => setHoveredLink('contact')}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => setIsOpen(false)}
                >
                  <Mail size={20} />
                  <span>Contact</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="flex items-center space-x-3 px-4 py-2 text-stone-800 hover:text-pink-200 hover:bg-white/20 rounded-lg transition-all duration-200"
                  onMouseEnter={() => setHoveredLink('faq')}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => setIsOpen(false)}
                >
                  <MessageCircleQuestion size={20} />
                  <span>F.A.Q.</span>
                </Link>
              </li>

              {isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    className="flex items-center space-x-3 px-4 py-2 mt-8 text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Sister's Admin</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
