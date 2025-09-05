// src/components/Header.tsx
'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu } from 'lucide-react'
import { useUser, UserButton, SignInButton, SignOutButton } from '@clerk/nextjs'

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void
}

/**
 * Header component updated to use Clerk for authentication and Zustand store for cart.
 */
export default function Header({ setIsSidebarOpen }: HeaderProps) {
  const { isSignedIn } = useUser()
  const [showDropdown, setShowDropdown] = useState(false)
  const cart = [] // replace with your store selector if needed

  return (
    <header className="fixed top-0 right-0 left-0 bg-white shadow-sm z-30 lg:pl-64">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Menu button - visible on mobile */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-md text-stone-500 hover:text-stone-600 hover:bg-stone-100 lg:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <div className="lg:hidden">
          <Link href="/">
            <img src="/assets/icons/swsh2.png" alt="SwipeShape" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 ml-auto">
          <Link href="/cart" className="relative p-2">
            <ShoppingCart size={24} className="text-stone-300 hover:text-pink-100" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>

          {isSignedIn ? (
            <div className="flex items-center relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center focus:outline-none"
              >
                <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8' } }} />
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <SignOutButton>
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Log out
                    </button>
                  </SignOutButton>
                </div>
              )}
            </div>
          ) : (
            <SignInButton>
              <button className="px-4 py-2 bg-stone-200 hover:bg-pink-300 text-[#415131] hover:text-violet-700 rounded-full text-sm font-medium transition-colors">
                Connexion
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}

