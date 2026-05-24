'use client'

import { useOptimistic, useTransition } from 'react'
import Link from 'next/link'
import type { Tool } from '@/lib/supabase/types'
import { toggleUpvote, toggleFavorite } from '@/lib/actions/social'
import { toast } from 'sonner'

type Props = {
  tool: Tool
  upvoted: boolean
  favorited: boolean
  variant: 'grid' | 'list'
  isGuest: boolean
}

const PRICING_LABELS: Record<string, string> = {
  open_source: 'Open Source',
  freemium: 'Freemium',
  paid: 'Paid',
  free: 'Free',
}

export function ToolCard({ tool, upvoted, favorited, variant, isGuest }: Props) {
  const [optimisticUpvoted, setOptimisticUpvoted] = useOptimistic(upvoted)
  const [optimisticCount, setOptimisticCount] = useOptimistic(tool.upvote_count)
  const [optimisticFaved, setOptimisticFaved] = useOptimistic(favorited)
  const [, startTransition] = useTransition()

  function handleUpvote(e: React.MouseEvent) {
    e.preventDefault()
    if (isGuest) {
      toast.info('Log in to upvote')
      return
    }
    startTransition(async () => {
      setOptimisticUpvoted(!optimisticUpvoted)
      setOptimisticCount(optimisticCount + (optimisticUpvoted ? -1 : 1))
      const result = await toggleUpvote(tool.id)
      if ('error' in result) toast.error(result.error)
    })
  }

  function handleFav(e: React.MouseEvent) {
    e.preventDefault()
    if (isGuest) {
      toast.info('Log in to save')
      return
    }
    startTransition(async () => {
      setOptimisticFaved(!optimisticFaved)
      const result = await toggleFavorite(tool.id)
      if ('error' in result) toast.error(result.error)
    })
  }

  const logoEl = tool.logo_url ? (
    <img src={tool.logo_url} alt="" style={{ width: 38, height: 38, objectFit: 'contain' }} />
  ) : (
    <span>{tool.name[0]}</span>
  )

  if (variant === 'list') {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 20px',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-lg)',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-2)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
            fontWeight: 700,
            flexShrink: 0,
            border: '1px solid var(--line)',
          }}
        >
          {logoEl}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{tool.name}</div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-2)',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {tool.description}
          </div>
        </div>
        <span className={`badge-pricing badge-pricing--${tool.pricing_model}`}>
          {PRICING_LABELS[tool.pricing_model]}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={`upvote-btn ${optimisticUpvoted ? 'on' : ''}`} onClick={handleUpvote} style={{ padding: '6px 10px' }}>
            ↑ <span>{optimisticCount.toLocaleString()}</span>
          </button>
          <button className={`fav-btn ${optimisticFaved ? 'on' : ''}`} onClick={handleFav} style={{ padding: '6px 10px' }}>
            {optimisticFaved ? '★' : '☆'}
          </button>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-xl)',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--r-lg)',
            background: 'var(--bg-2)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
            fontWeight: 700,
            border: '1px solid var(--line)',
          }}
        >
          {logoEl}
        </div>
        <button className={`fav-btn ${optimisticFaved ? 'on' : ''}`} onClick={handleFav} style={{ padding: '6px 8px', marginRight: -4 }}>
          {optimisticFaved ? '★' : '☆'}
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{tool.name}</div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--text-2)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {tool.description}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <span className={`badge-pricing badge-pricing--${tool.pricing_model}`}>
          {PRICING_LABELS[tool.pricing_model]}
        </span>
        <button
          className={`upvote-btn ${optimisticUpvoted ? 'on' : ''}`}
          onClick={handleUpvote}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', fontSize: 13 }}
        >
          ↑ <span>{optimisticCount.toLocaleString()}</span>
        </button>
      </div>
    </Link>
  )
}
