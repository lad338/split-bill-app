import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToastProvider } from '../hooks/useToast'
import AddPage from './AddPage'

const theme = createTheme()

// Mock FileImport so we can trigger onFile and onBeforeOpen directly in tests
vi.mock('../components/add/FileImport', () => ({
  default: ({
    onFile,
    onBeforeOpen,
  }: {
    onFile: (dataUrl: string) => void
    onBeforeOpen?: () => boolean
  }) => (
    <div>
      <button
        onClick={() => {
          if (!onBeforeOpen || onBeforeOpen()) onFile('data:image/jpeg;base64,abc')
        }}
      >
        trigger-file
      </button>
      <button onClick={() => onBeforeOpen?.()}>trigger-guard</button>
    </div>
  ),
}))

vi.mock('../services/geminiKey', () => ({
  getGeminiKey: vi.fn(),
}))

vi.mock('../services/analysis', () => ({
  analyzeReceiptImage: vi.fn(),
}))

vi.mock('../services/storage', () => ({
  saveReceipt: vi.fn().mockResolvedValue(undefined),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

import { getGeminiKey } from '../services/geminiKey'
import { analyzeReceiptImage } from '../services/analysis'

function setup() {
  const user = userEvent.setup()
  render(
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <MemoryRouter>
          <AddPage />
        </MemoryRouter>
      </ToastProvider>
    </ThemeProvider>
  )
  return { user }
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('AddPage key guard', () => {
  it('redirects to /gemini-key and shows toast when no API key is set', async () => {
    ;(getGeminiKey as ReturnType<typeof vi.fn>).mockReturnValue(null)
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'trigger-guard' }))
    expect(mockNavigate).toHaveBeenCalledWith('/gemini-key')
    expect(await screen.findByText('Please add your Gemini API key first')).toBeInTheDocument()
  })

  it('returns true (allows opening) when API key is set', async () => {
    ;(getGeminiKey as ReturnType<typeof vi.fn>).mockReturnValue('valid-key')
    ;(analyzeReceiptImage as ReturnType<typeof vi.fn>).mockResolvedValue({
      title: 'Test', date: undefined, items: [],
    })
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'trigger-file' }))
    expect(mockNavigate).not.toHaveBeenCalledWith('/gemini-key')
  })
})

describe('AddPage blank receipt', () => {
  it('renders the Add Blank Receipt button', () => {
    ;(getGeminiKey as ReturnType<typeof vi.fn>).mockReturnValue(null)
    setup()
    expect(screen.getByRole('button', { name: /add blank receipt/i })).toBeInTheDocument()
  })

  it('creates and navigates to a new blank receipt', async () => {
    ;(getGeminiKey as ReturnType<typeof vi.fn>).mockReturnValue(null)
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /add blank receipt/i }))
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/receipt\/.+/))
  })
})

describe('AddPage analysis error handling', () => {
  it('shows a warning toast when analysis throws', async () => {
    ;(getGeminiKey as ReturnType<typeof vi.fn>).mockReturnValue('valid-key')
    ;(analyzeReceiptImage as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('No receipt found in the image.')
    )
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'trigger-file' }))
    expect(await screen.findByText('No receipt found in the image.')).toBeInTheDocument()
  })
})
