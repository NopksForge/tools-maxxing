'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleUpvote } from '@/lib/actions/social'
import { toast } from 'sonner'

type Props = {
  toolId: string
  initialCount: number
  initialUpvoted: boolean
  isGuest: boolean
}

export function UpvoteButton({ toolId, initialCount, initialUpvoted, isGuest }: Props) {
  const [optimisticUpvoted, setOptimisticUpvoted] = useOptimistic(initialUpvoted)
  const [optimisticCount, setOptimisticCount] = useOptimistic(initialCount)
  const [, startTransition] = useTransition()

  function handleClick() {
    if (isGuest) {
      toast.info('Log in to upvote')
      return
    }
    startTransition(async () => {
      const next = !optimisticUpvoted
      setOptimisticUpvoted(next)
      setOptimisticCount(optimisticCount + (next ? 1 : -1))
      const result = await toggleUpvote(toolId)
      if ('error' in result) toast.error(result.error)
    })
  }

  return (
    <button
      className={`upvote-btn ${optimisticUpvoted ? 'on' : ''}`}
      onClick={handleClick}
      aria-label={`${optimisticUpvoted ? 'Remove upvote' : 'Upvote'} (${optimisticCount})`}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 14 }}
      type="button"
    >
      <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 10V2M2 6L6 2L10 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{optimisticCount.toLocaleString()}</span>
    </button>
  )
}
