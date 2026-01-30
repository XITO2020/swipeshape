
'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'

interface CommentFormProps {
  articleId: string
  programId: string
}

export default function CommentForm({ articleId, programId }: CommentFormProps) {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(false)
  const [hasUserPurchased, setHasUserPurchased] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')

  useEffect(() => {
    if (!isSignedIn) return
    setIsCheckingPurchase(true)
    fetch(`/api/user/verify-purchase?programId=${programId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setHasUserPurchased(data.hasPurchased))
      .catch(() => setPurchaseError('Unable to verify purchase.'))
      .finally(() => setIsCheckingPurchase(false))
  }, [isSignedIn, programId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setIsSubmitting(true)

    const res = await fetch('/api/article_comments/add', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, articleId, programId })
    })

    if (res.ok) {
      toast.success('Comment added!')
      setContent('')
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err?.message || 'Error posting comment.')
    }

    setIsSubmitting(false)
  }

  if (isCheckingPurchase) return <p>Checking purchase status...</p>
  if (!isSignedIn) {
    return (
      <div>
        <p>You must be signed in to comment.</p>
        <button onClick={() => router.push(`/sign-in?redirect=${pathname}`)}>
          Sign in
        </button>
      </div>
    )
  }
  if (purchaseError) return <p className="text-red-500">{purchaseError}</p>
  if (!hasUserPurchased) {
    return (
      <div>
        <p>Only purchasers can comment.</p>
        <button onClick={() => router.push(`/programs/${programId}`)}>
          View Program
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <textarea
        className="w-full p-2 border rounded"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={4}
        placeholder="Your comment..."
      />
      <button
        type="submit"
        className="bg-pink-600 text-white px-4 py-2 rounded"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}