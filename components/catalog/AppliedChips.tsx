'use client'

import { useSearchParams, useRouter } from 'next/navigation'

const LABELS: Record<string, Record<string, string>> = {
  pricing: { free: 'Free', open_source: 'Open Source', freemium: 'Freemium', paid: 'Paid' },
  deployment: { cloud: 'Cloud', local: 'Local', hybrid: 'Hybrid' },
  byok: { '1': 'BYOK' },
  api: { '1': 'Has API' },
}

export function AppliedChips() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const chips: { key: string; value: string; label: string }[] = []
  for (const [key, valueMap] of Object.entries(LABELS)) {
    const val = searchParams.get(key)
    if (val && valueMap[val]) {
      chips.push({ key, value: val, label: valueMap[val] })
    }
  }

  if (chips.length === 0) return null

  function removeChip(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      {chips.map((chip) => (
        <span key={chip.key} className="chip chip-active">
          {chip.label}
          <button
            onClick={() => removeChip(chip.key)}
            type="button"
            style={{ marginLeft: 4, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
