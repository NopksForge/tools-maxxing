import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = {
  title: 'Collections — Toolsmaxxing',
}

// Synchronous outer component — no data access here.
export default function CollectionsPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <Suspense fallback={<CollectionsSkeleton />}>
        <CollectionsContent />
      </Suspense>
    </div>
  )
}

async function CollectionsContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('collections')
    .select('id, name, slug, description, is_public, owner_id, profiles(username)')
    .order('created_at', { ascending: false })
    .limit(40)

  if (user) {
    query = query.or(`is_public.eq.true,owner_id.eq.${user.id}`)
  } else {
    query = query.eq('is_public', true)
  }

  const { data: collections } = await query

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div className="eyebrow">Curated lists</div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '10px 0 6px',
            }}
          >
            Collections
          </h1>
          <p className="lede">Community-curated lists of AI tools.</p>
        </div>
        {user && (
          <Link href="/settings#collections" className="btn primary">
            + New collection
          </Link>
        )}
      </div>

      {(collections ?? []).length === 0 ? (
        <p style={{ color: 'var(--text-2)', textAlign: 'center', padding: '60px 0' }}>
          No collections yet. Be the first to create one!
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {(collections ?? []).map((col: any) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              style={{
                padding: '20px 24px',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-xl)',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: 'var(--shadow-card)',
                display: 'block',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16 }}>{col.name}</div>
                {!col.is_public && (
                  <span
                    style={{
                      fontSize: 11,
                      background: 'var(--bg-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-sm)',
                      padding: '2px 6px',
                      color: 'var(--text-2)',
                    }}
                  >
                    Private
                  </span>
                )}
              </div>
              {col.description && (
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-2)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {col.description}
                </p>
              )}
              {col.profiles && (
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
                  by @{(col.profiles as any).username}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

function CollectionsSkeleton() {
  return (
    <div style={{ color: 'var(--text-2)', padding: '60px 0', textAlign: 'center' }}>
      Loading collections…
    </div>
  )
}
