import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

import { toggleUpvote, postReview, postComment } from '../social'
import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

const mockFrom = vi.fn()
const mockAuth = { getUser: vi.fn() }

beforeEach(() => {
  vi.clearAllMocks()
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: mockAuth,
    from: mockFrom,
  })
})

describe('toggleUpvote', () => {
  it('returns error when unauthenticated', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null } })
    const result = await toggleUpvote('tool-1')
    expect(result).toMatchObject({ error: expect.any(String) })
  })

  it('inserts upvote when not yet upvoted', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: mockInsert,
    })
    await toggleUpvote('tool-1')
    expect(mockInsert).toHaveBeenCalledWith({ user_id: 'user-1', tool_id: 'tool-1' })
    expect(revalidateTag).toHaveBeenCalledWith('tool-tool-1', 'max')
  })

  it('deletes upvote when already upvoted', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const mockEq2 = vi.fn().mockResolvedValue({ error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: 'user-1' }, error: null }),
      delete: mockDelete,
    })
    const result = await toggleUpvote('tool-1')
    expect(mockDelete).toHaveBeenCalled()
    expect(result).toMatchObject({ data: { upvoted: false } })
  })
})

describe('postReview', () => {
  it('upserts a review and revalidates', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ upsert: mockUpsert })
    const result = await postReview('tool-1', 4, 'Great tool!')
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ tool_id: 'tool-1', user_id: 'user-1', rating: 4, body: 'Great tool!' }),
      expect.any(Object)
    )
    expect(result).toEqual({ data: null })
  })
})

describe('postComment', () => {
  it('inserts a comment', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert: mockInsert })
    const result = await postComment('tool-1', null, 'Nice!')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ tool_id: 'tool-1', user_id: 'user-1', body: 'Nice!' })
    )
    expect(result).toEqual({ data: null })
  })
})
