import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UpvoteButton } from '../UpvoteButton'

vi.mock('@/lib/actions/social', () => ({
  toggleUpvote: vi.fn().mockResolvedValue({ data: { upvoted: true } }),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), info: vi.fn() },
}))

describe('UpvoteButton', () => {
  it('renders initial count', () => {
    render(
      <UpvoteButton
        toolId="tool-1"
        initialCount={42}
        initialUpvoted={false}
        isGuest={false}
      />
    )
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders in upvoted state when initialUpvoted=true', () => {
    render(
      <UpvoteButton
        toolId="tool-1"
        initialCount={43}
        initialUpvoted={true}
        isGuest={false}
      />
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/on/)
  })
})
