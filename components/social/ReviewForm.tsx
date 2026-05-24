'use client'

import { useState, useTransition } from 'react'
import { postReview } from '@/lib/actions/social'
import { toast } from 'sonner'

type Props = {
  toolId: string
  existingRating?: number
  existingBody?: string
  isGuest: boolean
}

export function ReviewForm({ toolId, existingRating, existingBody, isGuest }: Props) {
  const [rating, setRating] = useState(existingRating ?? 0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState(existingBody ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (isGuest) {
      toast.info('Log in to review')
      return
    }
    if (rating === 0) {
      toast.error('Choose a star rating')
      return
    }
    startTransition(async () => {
      const result = await postReview(toolId, rating, body)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Review posted')
      }
    })
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>
        Write a review
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            style={{
              fontSize: 22,
              color:
                star <= (hovered || rating) ? 'var(--teal)' : 'var(--line-strong)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 2px',
            }}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        className="field-input"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your experience…"
        style={{ marginBottom: 10 }}
      />

      <button
        className="btn primary"
        onClick={handleSubmit}
        disabled={isPending}
        type="button"
      >
        {isPending
          ? 'Posting…'
          : existingRating
          ? 'Update review'
          : 'Post review'}
      </button>
    </div>
  )
}
