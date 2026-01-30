'use client'

import { SignIn } from '@clerk/nextjs'
import React from 'react'

export default function LoginForm() {
  return (
    <div className="login-container">
      <h1>Connexion</h1>
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/register"
        appearance={{
          elements: {
            card: 'max-w-md mx-auto p-6 shadow-lg rounded-lg',
            formButtonPrimary: 'w-full'
          }
        }}
      />
    </div>
  )
}
