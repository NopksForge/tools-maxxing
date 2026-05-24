'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

type ActionResult<T> = { error: string } | { data: T }

export async function toggleUpvote(
  toolId: string
): Promise<ActionResult<{ upvoted: boolean }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('upvotes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('tool_id', toolId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('upvotes')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
    revalidateTag(`tool-${toolId}`, 'max')
    return { data: { upvoted: false } }
  }

  const { error } = await supabase
    .from('upvotes')
    .insert({ user_id: user.id, tool_id: toolId })
  if (error) return { error: error.message }

  revalidateTag(`tool-${toolId}`, 'max')
  return { data: { upvoted: true } }
}

export async function toggleFavorite(
  toolId: string
): Promise<ActionResult<{ favorited: boolean }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('tool_id', toolId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
    return { data: { favorited: false } }
  }

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, tool_id: toolId })
  if (error) return { error: error.message }

  return { data: { favorited: true } }
}

export async function postReview(
  toolId: string,
  rating: number,
  body: string
): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('reviews').upsert(
    { tool_id: toolId, user_id: user.id, rating, body },
    { onConflict: 'tool_id,user_id' }
  )
  if (error) return { error: error.message }

  revalidateTag(`tool-${toolId}`, 'max')
  return { data: null }
}

export async function postComment(
  toolId: string,
  parentId: string | null,
  body: string
): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('comments').insert({
    tool_id: toolId,
    parent_id: parentId ?? null,
    user_id: user.id,
    body,
  })
  if (error) return { error: error.message }

  revalidateTag(`tool-${toolId}`, 'max')
  return { data: null }
}
