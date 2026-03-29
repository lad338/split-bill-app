import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToastProvider } from '../hooks/useToast'
import GeminiKeyPage from './GeminiKeyPage'

const theme = createTheme()

function setup() {
  const user = userEvent.setup()
  render(
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/gemini-key']}>
          <GeminiKeyPage />
        </MemoryRouter>
      </ToastProvider>
    </ThemeProvider>
  )
  return { user }
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('GeminiKeyPage', () => {
  it('renders the page title and AI Studio link', () => {
    setup()
    expect(screen.getByText('Gemini API Key')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Google AI Studio/i })).toHaveAttribute(
      'href',
      'https://aistudio.google.com/api-keys'
    )
  })

  it('pre-fills the input with an existing stored key', () => {
    localStorage.setItem('gemini_api_key', 'existing-key-123')
    setup()
    expect(screen.getByLabelText('Gemini API key input')).toHaveValue('existing-key-123')
  })

  it('saves the trimmed key to localStorage on Confirm and shows toast', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('Gemini API key input'), '  my-new-key  ')
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(localStorage.getItem('gemini_api_key')).toBe('my-new-key')
    expect(await screen.findByText('API key saved')).toBeInTheDocument()
  })

  it('does not save when the input is empty or whitespace-only', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(localStorage.getItem('gemini_api_key')).toBeNull()
  })

  it('clears the key from localStorage and the input on Clear and shows toast', async () => {
    localStorage.setItem('gemini_api_key', 'existing-key')
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /clear/i }))
    expect(localStorage.getItem('gemini_api_key')).toBeNull()
    expect(screen.getByLabelText('Gemini API key input')).toHaveValue('')
    expect(await screen.findByText('API key cleared')).toBeInTheDocument()
  })
})
