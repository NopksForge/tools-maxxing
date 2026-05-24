import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cacheTag } from 'next/cache'
import type { CommentWithProfile } from '@/components/social/CommentThread'
import { UpvoteButton } from '@/components/social/UpvoteButton'
import { FavoriteButton } from '@/components/social/FavoriteButton'
import { ReviewForm } from '@/components/social/ReviewForm'
import { CommentThread } from '@/components/social/CommentThread'
import Link from 'next/link'

type Params = Promise<{ slug: string }>

async function getToolMeta(slug: string) {
  'use cache'
  cacheTag(`tool-slug-${slug}`)
  const supabase = await createClient()
  const { data } = await supabase
    .from('tools')
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const tool = await getToolMeta(slug)
  if (!tool) return { title: 'Tool not found — Toolsmaxxing' }
  return {
    title: `${tool.name} — Toolsmaxxing`,
    description: tool.description,
  }
}

// Synchronous outer component — no data access here; passes params Promise into Suspense.
// This matches the browse page pattern and avoids static prerender issues with cacheComponents.
export default function ToolPage({ params }: { params: Params }) {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
      <Suspense fallback={<ToolDetailSkeleton />}>
        <ToolDetailWrapper params={params} />
      </Suspense>
    </div>
  )
}

// Async component inside Suspense: resolves the slug, checks existence, calls notFound() if needed.
async function ToolDetailWrapper({ params }: { params: Params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: exists } = await supabase
    .from('tools')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (!exists) notFound()

  return <ToolDetail slug={slug} />
}

async function ToolDetail({ slug }: { slug: string }) {
  'use cache'
  cacheTag(`tool-slug-${slug}`)

  const supabase = await createClient()

  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!tool) return null

  // Tag with both slug and id (social actions invalidate by id)
  cacheTag(`tool-${tool.id}`)

  const [{ data: tagsData }, { data: mediaData }, { data: reviewsData }, { data: commentsRaw }] =
    await Promise.all([
      supabase
        .from('tool_tags')
        .select('tags(id, name, slug)')
        .eq('tool_id', tool.id),
      supabase
        .from('tool_media')
        .select('*')
        .eq('tool_id', tool.id),
      supabase
        .from('reviews')
        .select('*, profiles(username, avatar_url)')
        .eq('tool_id', tool.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('tool_id', tool.id)
        .order('created_at', { ascending: true }),
    ])

  const tags = tagsData?.flatMap((row: any) => row.tags ?? []) ?? []
  const media = mediaData ?? []
  const reviews = reviewsData ?? []
  const comments = (commentsRaw ?? []).map((c: any) => ({
    ...c,
    profile: c.profiles ?? null,
  })) as CommentWithProfile[]

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : null

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/browse"
          style={{
            fontSize: 13,
            color: 'var(--text-2)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 20,
          }}
        >
          ← Back to browse
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          {tool.logo_url ? (
            <img
              src={tool.logo_url}
              alt=""
              style={{
                width: 72,
                height: 72,
                objectFit: 'contain',
                borderRadius: 'var(--r-xl)',
                border: '1px solid var(--line)',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 'var(--r-xl)',
                background: 'var(--teal-soft)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 28,
                fontWeight: 800,
                color: 'var(--teal)',
                flexShrink: 0,
              }}
            >
              {tool.name[0]}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
              {tool.name}
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 15, margin: 0 }}>{tool.description}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <span className={`badge-pricing badge-pricing--${tool.pricing_model}`}>
                {tool.pricing_model.replace('_', ' ')}
              </span>
              {tool.deployment.map((d: string) => (
                <span key={d} className="badge-deploy">
                  {d}
                </span>
              ))}
              {tool.is_byok && <span className="badge-flag">BYOK</span>}
              {tool.has_api && <span className="badge-flag">API</span>}
            </div>
          </div>
        </div>

        {/* CTA row — social components rendered with guest defaults inside the cache */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
          <UpvoteButton
            toolId={tool.id}
            initialCount={tool.upvote_count}
            initialUpvoted={false}
            isGuest={true}
          />
          <FavoriteButton
            toolId={tool.id}
            initialFavorited={false}
            isGuest={true}
          />
          <a
            href={tool.homepage_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn primary"
          >
            Visit site →
          </a>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Tags
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tags.map((tag: any) => (
              <Link key={tag.id} href={`/browse?tag=${tag.slug}`} className="chip">
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Media */}
      {media.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Screenshots
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {media.map((m: any) => (
              <img
                key={m.id}
                src={m.url}
                alt=""
                style={{
                  height: 200,
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--line)',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviews summary */}
      {reviews.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Reviews
          </div>
          {avgRating !== null && (
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
              {'★'.repeat(Math.round(avgRating))}
              <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-2)', marginLeft: 8 }}>
                {avgRating.toFixed(1)} / 5 ({reviews.length})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Write review — guest state; sign-in required to post */}
      <ReviewForm toolId={tool.id} isGuest={true} />

      {/* Comments */}
      <div style={{ marginTop: 40 }}>
        <CommentThread toolId={tool.id} comments={comments} isGuest={true} />
      </div>
    </>
  )
}

function ToolDetailSkeleton() {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div
        style={{
          height: 72,
          width: 72,
          borderRadius: 'var(--r-xl)',
          background: 'var(--bg-2)',
          marginBottom: 16,
        }}
      />
      <div
        style={{
          height: 32,
          width: '60%',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-2)',
          marginBottom: 12,
        }}
      />
      <div style={{ height: 18, width: '80%', borderRadius: 'var(--r-md)', background: 'var(--bg-2)' }} />
    </div>
  )
}
