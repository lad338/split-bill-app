import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToastProvider } from '../../src/hooks/useToast'
import SharePanel from '../../src/components/details/SharePanel'
import type { Receipt } from '../../src/types'

const theme = createTheme()
function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}><ToastProvider>{children}</ToastProvider></ThemeProvider>
}
function renderUI(ui: React.ReactElement) { return render(ui, { wrapper: Wrapper }) }

const receipt: Receipt = {
  id: 'r1', title: 'Dinner', createdAt: 0, updatedAt: 0,
  paidBy: 'bob',
  people: [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }],
  items: [],
  settlements: [{ id: 's1', fromPersonId: 'alice', toPersonId: 'bob', amount: 30, amountPaid: 0 }],
}

describe('SharePanel', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders a Copy button', () => {
    renderUI(<SharePanel receipt={receipt} />)
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })

  it('calls clipboard.writeText with the message on Copy click', async () => {
    renderUI(<SharePanel receipt={receipt} />)
    await userEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Alice owes Bob $30.00')
    )
  })
})
