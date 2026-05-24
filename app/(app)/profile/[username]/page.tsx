import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tool } from '@/lib/supabase/types'
import { BrowseCatalogShell } from '@/components/catalog/BrowseCatalogShell'
import Link from 'next/link'

type Params = Promise<{ username: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { username } = await params
  return {
    title: `@${username} — Toolsmaxxing`,
  }
}

// Synchronous outer component — no data access here; passes params Promise into Suspense.
export default function ProfilePage({ params }: { params: Params }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent params={params} />
      </Suspense>
    </div>
  )
}

async function ProfileContent({ params }: { params: Params }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (!profile) notFound()

  const { data: submittedTools } = await supabase
    .from('tools')
    .select('*')
    .eq('submitted_by', profile.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: collections } = await supabase
    .from('collections')
    .select('id, name, slug, description, is_public')
    .eq('owner_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(12)

  const tools = (submittedTools ?? []) as Tool[]

  return (
    <>
      {/* Profile header */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 48 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--teal-soft)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--teal)',
            flexShrink: 0,
            border: '2px solid var(--line)',
            overflow: 'hidden',
          }}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            (username[0] ?? '?').toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 4px',
            }}
          >
            @{username}
          </h1>
          {profile.bio && (
            <p style={{ color: 'var(--text-2)', fontSize: 15, margin: '0 0 10px' }}>
              {profile.bio}
            </p>
          )}
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-2)' }}>
            <span>
              <strong style={{ color: 'var(--text-1)' }}>
                {profile.reputation_points ?? 0}
              </strong>{' '}
              reputation
            </span>
            <span>
              <strong style={{ color: 'var(--text-1)' }}>
                {tools.length}
              </strong>{' '}
              {tools.length === 1 ? 'tool' : 'tools'} submitted
            </span>
          </div>
        </div>
      </div>

      {/* Submitted tools */}
      {tools.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Submitted tools
          </div>
          <BrowseCatalogShell tools={tools} />
        </section>
      )}

      {/* Public collections */}
      {(collections ?? []).length > 0 && (
        <section>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Public collections
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {(collections ?? []).map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                style={{
                  padding: '16px 20px',
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-lg)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                  {col.name}
                </div>
                {col.description && (
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-2)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.description}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {tools.length === 0 && (collections ?? []).length === 0 && (
        <p style={{ color: 'var(--text-2)', textAlign: 'center', padding: '60px 0' }}>
          @{username} hasn&apos;t submitted any tools yet.
        </p>
      )}
    </>
  )
}

function ProfileSkeleton() {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 48 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--bg-2)',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ height: 28, width: '40%', borderRadius: 'var(--r-md)', background: 'var(--bg-2)', marginBottom: 10 }} />
          <div style={{ height: 16, width: '70%', borderRadius: 'var(--r-md)', background: 'var(--bg-2)' }} />
        </div>
      </div>
    </div>
  )
}
