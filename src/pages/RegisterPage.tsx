// src/pages/RegisterPage.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSignUp, useUser } from '@clerk/nextjs'
import { useAppStore } from '../lib/store'

export default function RegisterPage() {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const { setUser, setAuthState } = useAppStore()
  const { isLoaded, signUp, setActive } = useSignUp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('') // pour le OTP
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [step, setStep] = useState<'collect' | 'verify'>('collect')
  const [showPassword, setShowPassword] = useState(false)

  const callbackUrl =
    typeof router.query.callbackUrl === 'string' ? router.query.callbackUrl : '/'

  // Si l'utilisateur est déjà connecté via Clerk, on sync et redirige
  useEffect(() => {
    if (isSignedIn && user) {
      setUser({
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || '',
        created_at: user.createdAt
          ? new Date(user.createdAt).toISOString()
          : new Date().toISOString(),
      })
      const isAdmin =
        (user.publicMetadata as any)?.role === 'admin' ||
        user.emailAddresses?.some(e =>
          e.emailAddress.toLowerCase().includes('admin')
        )
      setAuthState(true, !!isAdmin)
      router.push(callbackUrl)
    }
  }, [isSignedIn, user, callbackUrl, setUser, setAuthState, router])

  const validateInitial = () => {
    if (!email || !password || !confirmPassword) {
      setError('Tous les champs sont requis.')
      return false
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Adresse email invalide.')
      return false
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return false
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return false
    }
    return true
  }

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!validateInitial()) return
    if (!isLoaded) {
      setError("Le service n'est pas encore prêt, réessaye dans un instant.")
      return
    }

    setIsSubmitting(true)
    try {
      // Création de l'inscription avec email + mot de passe
      await signUp.create({
        emailAddress: email,
        password,
      })

      if (signUp.status === 'complete') {
        // Pas besoin de vérification, activer la session si présente
        if (signUp.createdSessionId) {
          await setActive({ session: signUp.createdSessionId })
        }
      } else {
        // Envoyer le code de vérification par email
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        setStep('verify')
        setInfo('Un code a été envoyé à ton adresse email. Vérifie-le pour finaliser l’inscription.')
      }
    } catch (err: any) {
      console.error('Erreur inscription Clerk :', err)
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        'Erreur lors de la création du compte.'
      setError(String(msg))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!code.trim()) {
      setError('Le code est requis.')
      return
    }
    if (!isLoaded) {
      setError("Le service n'est pas prêt.")
      return
    }

    setIsVerifying(true)
    try {
      await signUp.attemptEmailAddressVerification({ code })

      if (signUp.status === 'complete') {
        if (signUp.createdSessionId) {
          await setActive({ session: signUp.createdSessionId })
        }
      } else {
        setError('Vérification échouée. Vérifie ton code et réessaye.')
      }
    } catch (err: any) {
      console.error('Erreur vérification email :', err)
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        'Erreur pendant la vérification.'
      setError(String(msg))
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setError(null)
    try {
      if (!isLoaded) {
        setError("Service non prêt.")
        return
      }
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setInfo('Le code a été renvoyé. Vérifie ta boîte mail.')
    } catch (err: any) {
      console.error('Erreur renvoi code :', err)
      setError('Impossible de renvoyer le code, réessaie plus tard.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md relative">
        <h1 className="text-2xl font-bold text-center text-purple-800 mb-6">
          Crée ton compte SwipeShape
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>
        )}
        {info && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">{info}</div>
        )}

        {step === 'collect' && (
          <form onSubmit={handleInitialSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value.trim())}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ton@email.com"
                required
              />
            </div>

            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-9 text-xs text-gray-600"
              >
                {showPassword ? 'Masquer' : 'Voir'}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Au moins 8 caractères. Utilise une phrase de passe si possible.
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirme le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition disabled:opacity-60"
            >
              {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} noValidate>
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                Un code a été envoyé à <strong>{email}</strong>. Entre-le pour valider ton compte.
              </p>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Code de vérification
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.trim())}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="123456"
                required
              />
            </div>

            <div className="flex gap-2 mb-4">
              <button
                type="submit"
                disabled={isVerifying}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition disabled:opacity-60"
              >
                {isVerifying ? 'Vérification...' : 'Valider le code'}
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition"
              >
                Renvoyer
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('collect')
                setError(null)
                setInfo(null)
              }}
              className="text-xs text-gray-600 underline"
            >
              Modifier email / mot de passe
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Tu as déjà un compte ?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-purple-600 hover:underline font-medium"
          >
            Connexion
          </button>
        </p>
      </div>
    </div>
  )
}
