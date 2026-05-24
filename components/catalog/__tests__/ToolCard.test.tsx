import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ToolCard } from '../ToolCard'
import type { Tool } from '@/lib/supabase/types'

vi.mock('@/lib/actions/social', () => ({
  toggleUpvote: vi.fn(),
  toggleFavorite: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), info: vi.fn() },
}))

const mockTool: Tool = {
  id: 'tool-1',
  slug: 'claude-code',
  name: 'Claude Code',
  description: 'AI coding assistant',
  homepage_url: 'https://claude.ai',
  repo_url: null,
  logo_url: null,
  normalized_url: 'https://claude.ai',
  pricing_model: 'freemium',
  deployment: ['cloud'],
  is_byok: false,
  has_api: true,
  submitted_by: null,
  is_pinned: false,
  pin_order: null,
  upvote_count: 42,
  search_vector: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
}

describe('ToolCard', () => {
  it('renders tool name in grid variant', () => {
    render(<ToolCard tool={mockTool} upvoted={false} favorited={false} variant="grid" isGuest={false} />)
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
  })

  it('renders tool name in list variant', () => {
    render(<ToolCard tool={mockTool} upvoted={false} favorited={false} variant="list" isGuest={false} />)
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
  })

  it('shows upvote count', () => {
    render(<ToolCard tool={mockTool} upvoted={false} favorited={false} variant="grid" isGuest={false} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('shows freemium badge', () => {
    render(<ToolCard tool={mockTool} upvoted={false} favorited={false} variant="grid" isGuest={false} />)
    expect(screen.getByText(/freemium/i)).toBeInTheDocument()
  })
})
