import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PeopleInput from '../../src/components/details/PeopleInput'
import type { Person } from '../../src/types'

const alice: Person = { id: 'alice', name: 'Alice' }
const bob: Person = { id: 'bob', name: 'Bob' }

describe('PeopleInput', () => {
  it('shows existing people as chips', () => {
    render(<PeopleInput people={[alice]} suggestions={[]} onChange={() => {}} onAddName={() => {}} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('chips appear inline with the input (before the text cursor)', () => {
    const { container } = render(
      <PeopleInput people={[alice]} suggestions={[]} onChange={() => {}} onAddName={() => {}} />
    )
    const input = container.querySelector('input[role="combobox"]')!
    const chip = screen.getByText('Alice').closest('[class*="Chip"]') as HTMLElement
    // chip should appear BEFORE the text input in DOM order (inline chips)
    expect(input.compareDocumentPosition(chip) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
  })

  it('shows all suggestions on focus before typing', async () => {
    render(<PeopleInput people={[alice]} suggestions={['Alice', 'Bob', 'Carol']} onChange={() => {}} onAddName={() => {}} />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    // Alice is already added, so only Bob and Carol appear
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Carol')).toBeInTheDocument()
    expect(screen.queryAllByRole('option').length).toBe(2)
  })

  it('narrows suggestions as user types', async () => {
    render(<PeopleInput people={[]} suggestions={['Alice', 'Bob']} onChange={() => {}} onAddName={() => {}} />)
    const input = screen.getByPlaceholderText(/add person/i)
    await userEvent.type(input, 'ali')
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('hides suggestions on blur even when draft is non-empty', async () => {
    render(<PeopleInput people={[]} suggestions={['Alice']} onChange={() => {}} onAddName={() => {}} />)
    const input = screen.getByPlaceholderText(/add person/i)
    await userEvent.type(input, 'ali')
    expect(screen.getByText('Alice')).toBeInTheDocument()
    await userEvent.tab() // blur
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('hides suggestions when not focused and draft is empty', async () => {
    render(<PeopleInput people={[]} suggestions={['Alice']} onChange={() => {}} onAddName={() => {}} />)
    const input = screen.getByPlaceholderText(/add person/i)
    await userEvent.click(input)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    await userEvent.tab() // blur
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('adds person via Enter key and calls onAddName', async () => {
    const onChange = vi.fn()
    const onAddName = vi.fn()
    render(<PeopleInput people={[]} suggestions={[]} onChange={onChange} onAddName={onAddName} />)
    await userEvent.type(screen.getByPlaceholderText(/add person/i), 'Carol{Enter}')
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'Carol' })])
    expect(onAddName).toHaveBeenCalledWith('Carol')
  })

  it('adds person via Enter key', async () => {
    const onChange = vi.fn()
    render(<PeopleInput people={[]} suggestions={[]} onChange={onChange} onAddName={() => {}} />)
    await userEvent.type(screen.getByPlaceholderText(/add person/i), 'Dave{Enter}')
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'Dave' })])
  })

  it('removes person when chip delete is clicked', async () => {
    const onChange = vi.fn()
    render(<PeopleInput people={[alice, bob]} suggestions={[]} onChange={onChange} onAddName={() => {}} />)
    await userEvent.click(screen.getByTitle(`Remove ${alice.name}`))
    expect(onChange).toHaveBeenCalledWith([bob])
  })

  it('trims whitespace from entered names', async () => {
    const onChange = vi.fn()
    render(<PeopleInput people={[]} suggestions={[]} onChange={onChange} onAddName={() => {}} />)
    await userEvent.type(screen.getByPlaceholderText(/add person/i), '  Alice  {Enter}')
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Alice' })])
    )
  })

  it('name input has maxLength of 30', () => {
    render(<PeopleInput people={[]} suggestions={[]} onChange={() => {}} onAddName={() => {}} />)
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('maxlength', '30')
  })

  it('does not add blank names via Enter', async () => {
    const onChange = vi.fn()
    render(<PeopleInput people={[]} suggestions={[]} onChange={onChange} onAddName={() => {}} />)
    await userEvent.click(screen.getByPlaceholderText(/add person/i))
    await userEvent.keyboard('{Enter}')
    expect(onChange).not.toHaveBeenCalled()
  })
})
