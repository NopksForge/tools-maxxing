import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tool } from '@/lib/supabase/types'
import { BrowseCatalogShell } from '@/components/catalog/BrowseCatalogShell'
import { removeFromCollection } from '@/lib/actions/collections'
import Link from 'next/link'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('collections')
    .select('name')
    .eq('slug', slug)
    .maybeSingle()
  return { title: data ? `${data.name} — Toolsmaxxing` : 'Collection — Toolsmaxxing' }
}

// Synchronous outer component — no data access here.
export default function CollectionDetailPage({ params }: { params: Params }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <Suspense fallback={<CollectionDetailSkeleton />}>
        <CollectionDetailContent params={params} />
      </Suspense>
    </div>
  )
}

async function CollectionDetailContent({ params }: { params: Params }) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: collection } = await supabase
    .from('collections')
    .select('*, profiles(username)')
    .eq('slug', slug)
    .maybeSingle()

  if (!collection) notFound()
  if (!collection.is_public && collection.owner_id !== user?.id) notFound()

  const isOwner = user?.id === collection.owner_id

  const { data: itemsData } = await supabase
    .from('collection_items')
    .select('tool_id, tools(*)')
    .eq('collection_id', collection.id)
    .order('position', { ascending: true })

  const tools = (itemsData ?? []).map((item: any) => item.tools).filter(Boolean) as Tool[]

  return (
    <>
      <Link
        href="/collections"
        style={{
          fontSize: 13,
          color: 'var(--text-2)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 24,
        }}
      >
        ← All collections
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              {collection.name}
            </h1>
            {!collection.is_public && (
              <span style={{ fontSize: 12, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '3px 8px', color: 'var(--text-2)' }}>
                Private
              </span>
            )}
          </div>
          {collection.description && (
            <p style={{ color: 'var(--text-2)', fontSize: 15, margin: '0 0 8px' }}>
              {collection.description}
            </p>
          )}
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            by{' '}
            <Link href={`/profile/${(collection as any).profiles?.username}`} style={{ color: 'var(--teal)' }}>
              @{(collection as any).profiles?.username}
            </Link>
            {' · '}
            {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
          </div>
        </div>
      </div>

      {tools.length === 0 ? (
        <p style={{ color: 'var(--text-2)', textAlign: 'center', padding: '60px 0' }}>
          This collection is empty.
        </p>
      ) : isOwner ? (
        <OwnerToolList tools={tools} collectionId={collection.id} />
      ) : (
        <BrowseCatalogShell tools={tools} />
      )}
    </>
  )
}

async function removeToolAction(
  collectionId: string,
  toolId: string,
  _formData: FormData
): Promise<void> {
  'use server'
  await removeFromCollection(collectionId, toolId)
}

function OwnerToolList({
  tools,
  collectionId,
}: {
  tools: Tool[]
  collectionId: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {tools.map((tool) => (
        <div
          key={tool.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 20px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-lg)',
          }}
        >
          <Link
            href={`/tools/${tool.slug}`}
            style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ fontWeight: 600, fontSize: 15 }}>{tool.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{tool.description}</div>
          </Link>
          <form action={removeToolAction.bind(null, collectionId, tool.id)}>
            <button
              type="submit"
              className="btn ghost"
              style={{ fontSize: 13, padding: '5px 12px', color: 'var(--text-2)' }}
            >
              Remove
            </button>
          </form>
        </div>
      ))}
    </div>
  )
}

function CollectionDetailSkeleton() {
  return (
    <div style={{ color: 'var(--text-2)', padding: '60px 0', textAlign: 'center' }}>
      Loading collection…
    </div>
  )
}
