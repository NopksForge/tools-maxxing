'use client'

import { useEffect, useState } from 'react'

type Layout = 'grid' | 'list'

type Props = {
  onChange: (layout: Layout) => void
}

const STORAGE_KEY = 'catalog-layout'

export function LayoutToggle({ onChange }: Props) {
  const [layout, setLayout] = useState<Layout>('grid')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Layout | null
    if (stored === 'grid' || stored === 'list') {
      setLayout(stored)
      onChange(stored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle(next: Layout) {
    setLayout(next)
    localStorage.setItem(STORAGE_KEY, next)
    onChange(next)
  }

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button
        className={`icon-btn ${layout === 'grid' ? 'active' : ''}`}
        onClick={() => toggle('grid')}
        aria-label="Grid view"
        title="Grid view"
        type="button"
      >
        ⊞
      </button>
      <button
        className={`icon-btn ${layout === 'list' ? 'active' : ''}`}
        onClick={() => toggle('list')}
        aria-label="List view"
        title="List view"
        type="button"
      >
        ≡
      </button>
    </div>
  )
}
