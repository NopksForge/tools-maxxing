import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SubmitWizard } from '../SubmitWizard'

vi.mock('@/lib/actions/catalog', () => ({
  checkDuplicate: vi.fn().mockResolvedValue({ duplicate: null }),
  submitTool: vi.fn().mockResolvedValue({ data: { slug: 'test-tool' } }),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}))

describe('SubmitWizard', () => {
  it('renders Step 1 (URL input) initially', () => {
    render(<SubmitWizard />)
    expect(screen.getByText(/step 1/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/https:\/\//i)).toBeInTheDocument()
  })

  it('advances to Step 2 after entering a URL and clicking Continue', async () => {
    const user = userEvent.setup()
    render(<SubmitWizard />)
    await user.type(screen.getByPlaceholderText(/https:\/\//i), 'https://example.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => {
      expect(screen.getByText(/step 2/i)).toBeInTheDocument()
    })
  })
})
