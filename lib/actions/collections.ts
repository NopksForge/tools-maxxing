'use server'

import { createClient } from '@/lib/supabase/server'

type ActionResult<T> = { error: string } | { data: T }

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 7)
  )
}

export async function createCollection(
  name: string,
  description: string,
  isPublic: boolean
): Promise<ActionResult<{ slug: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const slug = slugify(name)
  const { data, error } = await supabase
    .from('collections')
    .insert({ owner_id: user.id, name, slug, description, is_public: isPublic })
    .select('slug')
    .single()

  if (error) return { error: error.message }
  return { data: { slug: data.slug } }
}

export async function addToCollection(
  collectionId: string,
  toolId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: col } = await supabase
    .from('collections')
    .select('owner_id')
    .eq('id', collectionId)
    .single()
  if (!col || col.owner_id !== user.id) return { error: 'Forbidden' }

  const { data: items } = await supabase
    .from('collection_items')
    .select('position')
    .eq('collection_id', collectionId)
    .order('position', { ascending: false })
    .limit(1)
  const nextPosition = items?.[0]?.position != null ? items[0].position + 1 : 0

  const { error } = await supabase
    .from('collection_items')
    .insert({ collection_id: collectionId, tool_id: toolId, position: nextPosition })
  if (error) return { error: error.message }

  return { data: null }
}

export async function removeFromCollection(
  collectionId: string,
  toolId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: col } = await supabase
    .from('collections')
    .select('owner_id')
    .eq('id', collectionId)
    .single()
  if (!col || col.owner_id !== user.id) return { error: 'Forbidden' }

  await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('tool_id', toolId)

  return { data: null }
}
