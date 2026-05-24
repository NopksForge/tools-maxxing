'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleFavorite } from '@/lib/actions/social'
import { toast } from 'sonner'

type Props = {
  toolId: string
  initialFavorited: boolean
  isGuest: boolean
}

export function FavoriteButton({ toolId, initialFavorited, isGuest }: Props) {
  const [optimisticFaved, setOptimisticFaved] = useOptimistic(initialFavorited)
  const [, startTransition] = useTransition()

  function handleClick() {
    if (isGuest) {
      toast.info('Log in to save')
      return
    }
    startTransition(async () => {
      setOptimisticFaved(!optimisticFaved)
      const result = await toggleFavorite(toolId)
      if ('error' in result) toast.error(result.error)
    })
  }

  return (
    <button
      className={`fav-btn ${optimisticFaved ? 'on' : ''}`}
      onClick={handleClick}
      aria-label={optimisticFaved ? 'Remove from favorites' : 'Save to favorites'}
      style={{ padding: '10px 12px' }}
      type="button"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={optimisticFaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  )
}
