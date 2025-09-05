
'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '@clerk/nextjs'
import { Program } from '../../types'

interface ProgramDetailPageProps {
  initialProgram: Program | null
}

export default function ProgramDetailPage({ initialProgram }: ProgramDetailPageProps) {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const queryId = router.query.id as string | undefined
  const programId = queryId ?? ''
  const [program, setProgram] = useState<Program | null>(initialProgram)
  const [loading, setLoading] = useState(!initialProgram)
  const [hasPurchased, setHasPurchased] = useState(false)

  // Fetch program if not provided by parent
  useEffect(() => {
    if (!initialProgram && programId) {
      const fetchProgram = async () => {
        try {
          const res = await fetch(`/api/programs/${programId}`)
          if (!res.ok) throw new Error('Failed to fetch program')
          const data = await res.json()
          setProgram(data)
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(false)
        }
      }
      fetchProgram()
    } else if (initialProgram) {
      setLoading(false)
    }
  }, [initialProgram, programId])

  // Check purchase status
  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false)
      return
    }
    if (!programId) return
    const check = async () => {
      try {
        const res = await fetch(
          `/api/user/verify-purchase?programId=${programId}`,
          { credentials: 'include' }
        )
        if (res.ok) {
          const data = await res.json()
          setHasPurchased(data.hasPurchased)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [isSignedIn, programId])

  const handleAction = () => {
    if (!programId) return
    if (hasPurchased) {
      window.location.href = `/api/download?programId=${programId}`
    } else if (isSignedIn) {
      router.push(`/checkout?programId=${programId}`)
    } else {
      router.push(`/sign-in?redirect=/programs/${programId}`)
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }
  if (!program) {
    return <p>Programme non trouvé.</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{program.name}</h1>
      <p className="text-gray-700 mb-8">Prix : {program.price} €</p>
      <button
        onClick={handleAction}
        className={`px-4 py-2 rounded text-white ${
          hasPurchased ? 'bg-green-600 hover:bg-green-700' : 'bg-violet-600 hover:bg-violet-700'
        }`}
      >
        {hasPurchased ? 'Télécharger PDF' : isSignedIn ? 'Acheter' : 'Se connecter pour acheter'}
      </button>
    </div>
  )
}
