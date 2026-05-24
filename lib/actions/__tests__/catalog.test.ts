import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

import { checkDuplicate, submitTool } from '../catalog'
import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

const mockRpc = vi.fn()
const mockFrom = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    rpc: mockRpc,
    from: mockFrom,
  })
})

describe('checkDuplicate', () => {
  it('returns { duplicate: null } when no tool matches normalized URL', async () => {
    mockRpc.mockResolvedValue({ data: 'https://example.com', error: null })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })
    const result = await checkDuplicate('https://example.com')
    expect(result).toEqual({ duplicate: null })
  })

  it('returns the existing tool when URL matches', async () => {
    mockRpc.mockResolvedValue({ data: 'https://github.com/owner/repo', error: null })
    const existing = { id: 'tool-1', slug: 'my-tool', name: 'My Tool' }
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: existing, error: null }),
    })
    const result = await checkDuplicate('https://github.com/owner/repo/tree/main')
    expect(result).toEqual({ duplicate: existing })
  })
})

describe('submitTool', () => {
  it('returns error when user is not authenticated', async () => {
    ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      rpc: mockRpc,
      from: mockFrom,
    })
    const result = await submitTool({
      url: 'https://example.com',
      name: 'Test',
      description: 'desc',
      logo_url: '',
      repo_url: '',
      pricing_model: 'free',
      deployment: ['cloud'],
      is_byok: false,
      has_api: false,
      tags: [],
      media: [],
    })
    expect(result).toMatchObject({ error: expect.any(String) })
  })

  it('returns slug on successful insert', async () => {
    mockRpc.mockResolvedValue({ data: 'https://example.com', error: null })
    const insertedTool = { id: 'tool-1', slug: 'test-tool' }
    // checkDuplicate lookup returns null (no existing)
    // submitTool insert returns the tool
    let fromCallCount = 0
    mockFrom.mockImplementation(() => {
      fromCallCount++
      if (fromCallCount === 1) {
        // checkDuplicate query
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }
      // insert tool
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: insertedTool, error: null }),
        }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    })
    const result = await submitTool({
      url: 'https://example.com',
      name: 'Test',
      description: 'desc',
      logo_url: '',
      repo_url: '',
      pricing_model: 'free',
      deployment: ['cloud'],
      is_byok: false,
      has_api: false,
      tags: [],
      media: [],
    })
    expect(result).toMatchObject({ data: { slug: 'test-tool' } })
  })
})
