// src/pages/login.tsx
'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { SignIn, useUser } from '@clerk/nextjs'
import { useAppStore } from '../lib/store'

export default function LoginPage() {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const { setUser, setAuthState } = useAppStore()

  const callbackUrl =
    typeof router.query.callbackUrl === 'string' ? router.query.callbackUrl : '/'

  // Dès que Clerk a authentifié l'utilisateur, on met à jour le store et on redirige
  useEffect(() => {
    if (isSignedIn && user) {
      setUser({
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || '',
        created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      })
      // Détection admin basique (tu peux migrer ça vers publicMetadata dans Clerk)
      const isAdmin = user.emailAddresses?.some(e =>
        e.emailAddress.toLowerCase().includes('admin')
      )
      setAuthState(true, !!isAdmin)
      router.push(callbackUrl)
    }
  }, [isSignedIn, user, callbackUrl, setUser, setAuthState, router])

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64 flex items-center justify-center bg-purple-50 relative">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md z-10">
        <h1 className="text-2xl font-bold text-purple-800 mb-6 text-center">
          Connectez-vous à Swipe-Shape
        </h1>
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/register"
          appearance={{
            elements: {
              card: 'shadow-lg rounded-lg p-4',
              formButtonPrimary: 'w-full',
            },
          }}
        />
        <p className="mt-4 text-center text-sm text-gray-600">
          Pas encore de compte?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-purple-600 hover:text-purple-800 underline"
          >
            Inscrivez-vous
          </button>
        </p>
      </div>
    </div>
  )
}
