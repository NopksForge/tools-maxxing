'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback } from 'react'

const PRICING_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'open_source', label: 'Open Source' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
]

const DEPLOYMENT_OPTIONS = [
  { value: 'cloud', label: 'Cloud' },
  { value: 'local', label: 'Local' },
  { value: 'hybrid', label: 'Hybrid' },
]

export function FilterRail() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  const pricing = searchParams.get('pricing')
  const deployment = searchParams.get('deployment')
  const byok = searchParams.get('byok')
  const api = searchParams.get('api')

  return (
    <aside style={{ width: 220, flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
        <div className="filter-section">
          <div className="filter-section-label">Pricing</div>
          {PRICING_OPTIONS.map((opt) => (
            <label key={opt.value} className="filter-option">
              <input
                type="radio"
                name="pricing"
                checked={pricing === opt.value}
                onChange={() =>
                  setParam('pricing', pricing === opt.value ? null : opt.value)
                }
              />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="filter-section">
          <div className="filter-section-label">Deployment</div>
          {DEPLOYMENT_OPTIONS.map((opt) => (
            <label key={opt.value} className="filter-option">
              <input
                type="radio"
                name="deployment"
                checked={deployment === opt.value}
                onChange={() =>
                  setParam('deployment', deployment === opt.value ? null : opt.value)
                }
              />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="filter-section">
          <div className="filter-section-label">Features</div>
          <label className="filter-option">
            <input
              type="checkbox"
              checked={byok === '1'}
              onChange={(e) => setParam('byok', e.target.checked ? '1' : null)}
            />
            BYOK
          </label>
          <label className="filter-option">
            <input
              type="checkbox"
              checked={api === '1'}
              onChange={(e) => setParam('api', e.target.checked ? '1' : null)}
            />
            Has API
          </label>
        </div>

        {(pricing || deployment || byok || api) && (
          <button
            className="btn ghost"
            style={{ width: '100%', marginTop: 12 }}
            onClick={() => router.replace('?', { scroll: false })}
            type="button"
          >
            Clear filters
          </button>
        )}
      </div>
    </aside>
  )
}
