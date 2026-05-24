'use client'

import { useState, useTransition } from 'react'
import { checkDuplicate } from '@/lib/actions/catalog'
import type { Tool } from '@/lib/supabase/types'
import Link from 'next/link'

type Props = {
  onContinue: (url: string) => void
}

export function StepUrl({ onContinue }: Props) {
  const [url, setUrl] = useState('')
  const [duplicate, setDuplicate] = useState<Tool | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleBlur() {
    if (!url || !url.startsWith('http')) return
    setIsChecking(true)
    startTransition(async () => {
      const result = await checkDuplicate(url)
      setDuplicate(result.duplicate)
      setIsChecking(false)
    })
  }

  function handleContinue() {
    if (!url.startsWith('http')) {
      setError('Enter a valid URL starting with https://')
      return
    }
    setError('')
    onContinue(url)
  }

  return (
    <div className="wizard-step">
      <div className="eyebrow">Step 1 of 2</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 4px' }}>
        Tool URL
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>
        Enter the homepage or repository URL. We'll check for duplicates.
      </p>

      <label className="field-label" htmlFor="tool-url">
        Homepage URL
      </label>
      <input
        id="tool-url"
        className="field-input"
        type="url"
        placeholder="https://"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={handleBlur}
      />
      {error && <p className="field-error">{error}</p>}

      {duplicate && (
        <div className="duplicate-warning">
          <strong>Heads up:</strong> This tool may already exist:{' '}
          <Link href={`/tools/${duplicate.slug}`}>{duplicate.name}</Link>. You
          can still submit if it's a different tool.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button
          className="btn primary"
          onClick={handleContinue}
          disabled={!url}
        >
          {isChecking ? 'Checking…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
