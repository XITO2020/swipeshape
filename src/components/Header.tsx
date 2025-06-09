import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { logout } from '../lib/useAuth';

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen }) => {
  const { isAuthenticated, user, cart } = useAppStore();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 bg-white shadow-sm z-30 lg:pl-64">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Menu button - visible sur tous les écrans */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-md text-stone-500 hover:text-stone-600 hover:bg-stone-100 lg:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Logo - only show on mobile */}
        <div className="lg:hidden">
          <Link href="/">
            <img src="/assets/icons/swsh2.png" alt="SwipeShape" className="h-8 w-auto" />
          </Link>
        </div>
        
        <div className="flex items-center space-x-4 ml-auto">
          <Link href="/cart" className="relative p-2">
            <ShoppingCart size={24} className="text-stone-300 hover:text-pink-100" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center focus:outline-none"
              >
                {user?.avatar_url ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-1">
                    <img 
                      src={user.avatar_url} 
                      alt={user.name || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center mr-1">
                    <span className="text-sm font-medium text-stone-600">
                      {user?.name?.[0] || 'U'}
                    </span>
                  </div>
                )}
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link 
                    href="/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <UserIcon size={16} className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/sign-in"
              className="px-4 py-2 bg-stone-200 hover:bg-pink-300 text-[#415131] hover:text-violet-700 rounded-full text-sm font-medium transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;