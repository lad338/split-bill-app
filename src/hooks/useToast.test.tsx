import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToastProvider, useToast } from './useToast'

const theme = createTheme()

function TestConsumer({ message, severity }: { message: string; severity?: 'success' | 'warning' }) {
  const { showToast } = useToast()
  return <button onClick={() => showToast(message, severity)}>trigger</button>
}

function setup(message: string, severity?: 'success' | 'warning') {
  const user = userEvent.setup()
  render(
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <TestConsumer message={message} severity={severity} />
      </ToastProvider>
    </ThemeProvider>
  )
  return { user }
}

describe('useToast', () => {
  it('shows a success toast when showToast is called', async () => {
    const { user } = setup('Receipt added')
    await user.click(screen.getByRole('button'))
    expect(await screen.findByText('Receipt added')).toBeInTheDocument()
  })

  it('shows a warning toast when severity is warning', async () => {
    const { user } = setup('Please set paid person', 'warning')
    await user.click(screen.getByRole('button'))
    expect(await screen.findByText('Please set paid person')).toBeInTheDocument()
  })

  it('defaults to success severity', async () => {
    const { user } = setup('Item added')
    await user.click(screen.getByRole('button'))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveClass('MuiAlert-colorSuccess')
  })

  it('throws when useToast is used outside ToastProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ThemeProvider theme={theme}><TestConsumer message="x" /></ThemeProvider>)).toThrow()
    spy.mockRestore()
  })
})
