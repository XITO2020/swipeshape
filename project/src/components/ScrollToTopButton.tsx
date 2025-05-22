import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ isSidebarOpen, closeSidebar }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > window.innerHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleClick = () => {
    closeSidebar();
    scrollToTop();
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-300`}
    >
      <button
        onClick={handleClick}
        className="bg-lime-400 text-white p-3 rounded-full shadow-md hover:bg-[#3afc5e] transition-colors animate-pulse hover:animate-bounce"
      >
        <ArrowUp size={24} />
      </button>
      {isSidebarOpen && (
        <button
          onClick={scrollToTop}
          className="ml-2 bg-purple-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
        >
          Revenir au menu
        </button>
      )}
    </div>
  );
};

export default ScrollToTopButton;
