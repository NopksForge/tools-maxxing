'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'
import type { Tool } from '@/lib/supabase/types'

type ActionResult<T> = { error: string } | { data: T }

export async function checkDuplicate(
  url: string
): Promise<{ duplicate: Tool | null }> {
  const supabase = await createClient()

  const { data: normalizedUrl, error: rpcError } = await supabase.rpc(
    'canonicalize_url',
    { url }
  )
  if (rpcError || !normalizedUrl) return { duplicate: null }

  const { data: existing } = await supabase
    .from('tools')
    .select('id, slug, name, logo_url, pricing_model')
    .eq('normalized_url', normalizedUrl)
    .maybeSingle()

  return { duplicate: existing ?? null }
}

export type SubmitToolInput = {
  url: string
  name: string
  description: string
  logo_url: string
  repo_url: string
  pricing_model: 'open_source' | 'freemium' | 'paid' | 'free'
  deployment: string[]
  is_byok: boolean
  has_api: boolean
  tags: { id?: string; name: string }[]
  media: { type: 'image' | 'video'; url: string }[]
}

export async function submitTool(
  input: SubmitToolInput
): Promise<ActionResult<{ slug: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to submit a tool.' }
  }

  const { data: normalizedUrl, error: rpcError } = await supabase.rpc(
    'canonicalize_url',
    { url: input.url }
  )
  if (rpcError || !normalizedUrl) {
    return { error: 'Could not normalize URL.' }
  }

  // Final duplicate check before insert
  const { data: existing } = await supabase
    .from('tools')
    .select('slug')
    .eq('normalized_url', normalizedUrl)
    .maybeSingle()
  if (existing) {
    return { error: `This tool already exists: /tools/${existing.slug}` }
  }

  const slug = slugify(input.name)

  const { data: tool, error: insertError } = await supabase
    .from('tools')
    .insert({
      slug,
      name: input.name,
      description: input.description,
      homepage_url: input.url,
      repo_url: input.repo_url || null,
      logo_url: input.logo_url || null,
      normalized_url: normalizedUrl,
      pricing_model: input.pricing_model,
      deployment: input.deployment,
      is_byok: input.is_byok,
      has_api: input.has_api,
      submitted_by: user.id,
    })
    .select('id, slug')
    .single()

  if (insertError || !tool) {
    if (insertError?.code === '23505') {
      return { error: 'A tool with this URL or name already exists.' }
    }
    return { error: insertError?.message ?? 'Failed to submit tool.' }
  }

  // Insert tags (create new ones if they don't exist)
  for (const tag of input.tags) {
    let tagId = tag.id
    if (!tagId) {
      const tagSlug = slugify(tag.name)
      const { data: upserted } = await supabase
        .from('tags')
        .upsert({ name: tag.name, slug: tagSlug }, { onConflict: 'slug' })
        .select('id')
        .single()
      tagId = upserted?.id
    }
    if (tagId) {
      await supabase.from('tool_tags').insert({ tool_id: tool.id, tag_id: tagId })
    }
  }

  // Insert media URLs
  if (input.media.length > 0) {
    await supabase.from('tool_media').insert(
      input.media.map((m) => ({
        tool_id: tool.id,
        type: m.type,
        url: m.url,
        added_by: user.id,
      }))
    )
  }

  revalidateTag('catalog')
  return { data: { slug: tool.slug } }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
