import type { Tool, Tag, Review, Collection } from '../types'

test('Tool type has required fields', () => {
  const t: Tool = {
    id: 'uuid',
    slug: 'test-tool',
    name: 'Test Tool',
    description: 'desc',
    homepage_url: 'https://example.com',
    repo_url: null,
    logo_url: null,
    normalized_url: 'https://example.com',
    pricing_model: 'free',
    deployment: ['cloud'],
    is_byok: false,
    has_api: false,
    submitted_by: null,
    is_pinned: false,
    pin_order: null,
    upvote_count: 0,
    search_vector: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  }
  expect(t.slug).toBe('test-tool')
})
