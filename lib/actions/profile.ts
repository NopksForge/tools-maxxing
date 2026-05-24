'use server'

import { createClient } from '@/lib/supabase/server'

type ActionResult<T> = { error: string } | { data: T }

export async function updateProfile(
  username: string,
  bio: string,
  avatarUrl: string
): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (username) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .maybeSingle()
    if (existing) return { error: 'Username is already taken.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username: username || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { data: null }
}
