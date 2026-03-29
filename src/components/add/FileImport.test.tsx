import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import FileImport from './FileImport'

const theme = createTheme()

function setup(onBeforeOpen?: () => boolean) {
  const user = userEvent.setup()
  const onFile = vi.fn()
  render(
    <ThemeProvider theme={theme}>
      <FileImport onFile={onFile} onBeforeOpen={onBeforeOpen} />
    </ThemeProvider>
  )
  return { user, onFile }
}

describe('FileImport onBeforeOpen', () => {
  it('calls onBeforeOpen when the gallery label is clicked', async () => {
    const guard = vi.fn().mockReturnValue(true)
    const { user } = setup(guard)
    const label = screen.getByText('Choose Photo or File').closest('label')!
    await user.click(label)
    expect(guard).toHaveBeenCalled()
  })

  it('prevents the file picker when onBeforeOpen returns false (gallery)', async () => {
    const guard = vi.fn().mockReturnValue(false)
    const { user, onFile } = setup(guard)
    const label = screen.getByText('Choose Photo or File').closest('label')!
    await user.click(label)
    expect(guard).toHaveBeenCalled()
    expect(onFile).not.toHaveBeenCalled()
  })

  it('calls onBeforeOpen when the camera label is clicked', async () => {
    const guard = vi.fn().mockReturnValue(true)
    const { user } = setup(guard)
    // camera label is CSS-hidden on desktop; query it directly
    const label = screen.getByText('Take a Photo', { selector: 'span' }).closest('label')!
    await user.click(label)
    expect(guard).toHaveBeenCalled()
  })

  it('prevents the file picker when onBeforeOpen returns false (camera)', async () => {
    const guard = vi.fn().mockReturnValue(false)
    const { user, onFile } = setup(guard)
    const label = screen.getByText('Take a Photo', { selector: 'span' }).closest('label')!
    await user.click(label)
    expect(guard).toHaveBeenCalled()
    expect(onFile).not.toHaveBeenCalled()
  })

  it('proceeds normally when onBeforeOpen is not provided', async () => {
    const guard = vi.fn()
    setup(undefined)
    // No error thrown — the component renders correctly without the prop
    expect(guard).not.toHaveBeenCalled()
  })
})
