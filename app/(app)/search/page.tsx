import { Suspense } from 'react'
import { createPublicClient } from '@/lib/supabase/server'
import { cacheTag } from 'next/cache'
import type { Tool } from '@/lib/supabase/types'
import { FilterRail } from '@/components/catalog/FilterRail'
import { AppliedChips } from '@/components/catalog/AppliedChips'
import { BrowseCatalogShell } from '@/components/catalog/BrowseCatalogShell'

export const metadata = {
  title: 'Search — Toolsmaxxing',
}

type FilterParams = {
  q?: string
  pricing?: string
  deployment?: string
  byok?: string
  api?: string
}

type SearchParams = Promise<FilterParams>

export default function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <Suspense>
      <SearchPageInner searchParams={searchParams} />
    </Suspense>
  )
}

async function SearchPageInner({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow">Search</div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '10px 0 6px',
          }}
        >
          {q ? (
            <>Results for &ldquo;{q}&rdquo;</>
          ) : (
            'Search AI Tools'
          )}
        </h1>
        <form method="get" action="/search" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, maxWidth: 480 }}>
            <input
              name="q"
              className="field-input"
              style={{ flex: 1 }}
              defaultValue={q}
              placeholder="Search tools…"
              autoFocus
            />
            <button className="btn primary" type="submit">
              Search
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        <Suspense>
          <FilterRail />
        </Suspense>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Suspense fallback={<div style={{ color: 'var(--text-2)' }}>Searching…</div>}>
            {q ? (
              <>
                <AppliedChips />
                <SearchGrid params={params} q={q} />
              </>
            ) : (
              <p style={{ color: 'var(--text-2)' }}>
                Enter a query above to search.
              </p>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function SearchGrid({ params, q }: { params: FilterParams; q: string }) {
  return <CachedSearchResults params={params} q={q} />
}

async function CachedSearchResults({
  params,
  q,
}: {
  params: FilterParams
  q: string
}) {
  'use cache'
  cacheTag('catalog')

  const supabase = createPublicClient()
  let tools: Tool[] = []

  // FTS for queries longer than 2 chars
  if (q.length > 2) {
    const { data: ftsResults } = await supabase
      .from('tools')
      .select('*')
      .textSearch('search_vector', q, { type: 'websearch', config: 'english' })
      .limit(60)
    tools = (ftsResults as Tool[]) ?? []
  }

  // Trigram fallback if FTS returns nothing or query is too short
  if (tools.length === 0) {
    const { data: trigramResults } = await supabase
      .from('tools')
      .select('*')
      .ilike('name', `%${q}%`)
      .limit(60)
    tools = (trigramResults as Tool[]) ?? []
  }

  // Apply filters on the result set
  if (params.pricing) tools = tools.filter((t) => t.pricing_model === params.pricing)
  if (params.deployment)
    tools = tools.filter((t) => t.deployment.includes(params.deployment!))
  if (params.byok === '1') tools = tools.filter((t) => t.is_byok)
  if (params.api === '1') tools = tools.filter((t) => t.has_api)

  if (tools.length === 0) {
    return (
      <p style={{ color: 'var(--text-2)' }}>
        No tools found for &ldquo;{q}&rdquo;.
      </p>
    )
  }

  return <BrowseCatalogShell tools={tools} />
}
