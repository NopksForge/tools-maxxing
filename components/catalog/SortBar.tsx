'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { LayoutToggle } from './LayoutToggle'

type Props = {
  total: number
  onLayoutChange: (layout: 'grid' | 'list') => void
}

export function SortBar({ total, onLayoutChange }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sort = searchParams.get('sort') ?? 'newest'

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
        {total.toLocaleString()} {total === 1 ? 'tool' : 'tools'}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={`btn ghost ${sort === 'newest' ? 'active' : ''}`}
            onClick={() => setSort('newest')}
            style={{ fontSize: 13, padding: '5px 12px' }}
            type="button"
          >
            Newest
          </button>
          <button
            className={`btn ghost ${sort === 'top' ? 'active' : ''}`}
            onClick={() => setSort('top')}
            style={{ fontSize: 13, padding: '5px 12px' }}
            type="button"
          >
            Top
          </button>
        </div>
        <LayoutToggle onChange={onLayoutChange} />
      </div>
    </div>
  )
}
