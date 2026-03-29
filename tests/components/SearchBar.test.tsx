import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import SearchBar from '../../src/components/list/SearchBar'

describe('SearchBar', () => {
  it('calls onChange when user types', async () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    await userEvent.type(screen.getByRole('searchbox'), 'dinner')
    expect(onChange).toHaveBeenCalled()
  })

  it('displays the provided value', () => {
    render(<SearchBar value="lunch" onChange={() => {}} />)
    expect(screen.getByRole('searchbox')).toHaveValue('lunch')
  })
})
