import { Suspense } from 'react'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/server'
import { cacheTag } from 'next/cache'
import type { Tool } from '@/lib/supabase/types'
import { FilterRail } from '@/components/catalog/FilterRail'
import { AppliedChips } from '@/components/catalog/AppliedChips'
import { BrowseCatalogShell } from '@/components/catalog/BrowseCatalogShell'

export const metadata = {
  title: 'Browse — Toolsmaxxing',
  description: 'Discover community-curated AI tools',
}

type FilterParams = {
  pricing?: string
  deployment?: string
  byok?: string
  api?: string
  sort?: string
}

type SearchParams = Promise<FilterParams>

export default function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow">Catalog</div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '12px 0 8px',
          }}
        >
          Browse AI Tools
        </h1>
        <p className="lede">
          Community-curated tools with strict pricing badges. No hype, just signal.
        </p>
        <Link
          href="/submit"
          className="btn primary"
          style={{ marginTop: 16, display: 'inline-flex' }}
        >
          + Submit a tool
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        <Suspense>
          <FilterRail />
        </Suspense>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Suspense fallback={<div style={{ color: 'var(--text-2)' }}>Loading…</div>}>
            <AppliedChips />
            <CatalogGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function CatalogGrid({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  return <CachedCatalog params={params} />
}

async function CachedCatalog({ params }: { params: FilterParams }) {
  'use cache'
  cacheTag('catalog')

  const supabase = createPublicClient()
  let query = supabase.from('tools').select('*')

  if (params.pricing) query = query.eq('pricing_model', params.pricing)
  if (params.deployment) query = query.contains('deployment', [params.deployment])
  if (params.byok === '1') query = query.eq('is_byok', true)
  if (params.api === '1') query = query.eq('has_api', true)

  const sort = params.sort ?? 'newest'
  if (sort === 'top') {
    query = query.order('upvote_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: tools, error } = await query.limit(60)
  if (error || !tools) return <p style={{ color: 'var(--text-2)' }}>Failed to load tools.</p>

  return <BrowseCatalogShell tools={tools as Tool[]} />
}
