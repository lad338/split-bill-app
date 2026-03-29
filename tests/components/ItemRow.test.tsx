import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToastProvider } from '../../src/hooks/useToast'
import ItemRow from '../../src/components/details/ItemRow'
import type { ReceiptItem, Person } from '../../src/types'

const theme = createTheme()
function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}><ToastProvider>{children}</ToastProvider></ThemeProvider>
}
function renderUI(ui: React.ReactElement) { return render(ui, { wrapper: Wrapper }) }

const people: Person[] = [
  { id: 'alice', name: 'Alice' },
  { id: 'bob', name: 'Bob' },
]

const item: ReceiptItem = {
  id: 'item1',
  name: 'Pizza',
  price: 20,
  shares: [
    { personId: 'alice', percentage: 50 },
    { personId: 'bob', percentage: 50 },
  ],
}

const defaultProps = { editingItemId: null as string | null, onEditStart: () => {}, onEditEnd: () => {} }

describe('ItemRow', () => {
  it('shows item name in collapsed state', () => {
    renderUI(<ItemRow item={item} people={people} onChange={() => {}} onDelete={() => {}} {...defaultProps} />)
    expect(screen.getByText('Pizza')).toBeInTheDocument()
  })

  it('does not show share inputs in collapsed state', () => {
    renderUI(<ItemRow item={item} people={people} onChange={() => {}} onDelete={() => {}} {...defaultProps} />)
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('expands when row is clicked', async () => {
    renderUI(<ItemRow item={item} people={people} onChange={() => {}} onDelete={() => {}} {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit pizza/i }))
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('calls onChange with item on collapse when shares are valid', async () => {
    const onChange = vi.fn()
    renderUI(<ItemRow item={item} people={people} onChange={onChange} onDelete={() => {}} {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit pizza/i }))
    await userEvent.click(screen.getByRole('button', { name: /collapse item/i }))
    expect(onChange).toHaveBeenCalledWith(item)
  })

  it('reset button restores draft to original values without saving', async () => {
    const onChange = vi.fn()
    renderUI(<ItemRow item={item} people={people} onChange={onChange} onDelete={() => {}} {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit pizza/i }))
    const nameInput = screen.getByDisplayValue('Pizza')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Pasta')
    await userEvent.click(screen.getByRole('button', { name: /reset item/i }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByDisplayValue('Pizza')).toBeInTheDocument()
  })

  it('shows delete confirmation on Delete click', async () => {
    renderUI(<ItemRow item={item} people={people} onChange={() => {}} onDelete={() => {}} {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit pizza/i }))
    await userEvent.click(screen.getByRole('button', { name: /delete item/i }))
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel delete/i })).toBeInTheDocument()
  })

  it('calls onDelete after confirming delete', async () => {
    const onDelete = vi.fn()
    renderUI(<ItemRow item={item} people={people} onChange={() => {}} onDelete={onDelete} {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit pizza/i }))
    await userEvent.click(screen.getByRole('button', { name: /delete item/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm delete/i }))
    expect(onDelete).toHaveBeenCalledWith('item1')
  })

  it('does not call onChange when collapsing with invalid shares', async () => {
    const onChange = vi.fn()
    const badItem: ReceiptItem = { ...item, shares: [{ personId: 'alice', percentage: 60 }] }
    renderUI(<ItemRow item={badItem} people={people} onChange={onChange} onDelete={() => {}} {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit pizza/i }))
    await userEvent.click(screen.getByRole('button', { name: /collapse item/i }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('equal split button distributes 100% equally among all people', async () => {
    const onChange = vi.fn()
    const unevenItem: ReceiptItem = { ...item, shares: [{ personId: 'alice', percentage: 20 }, { personId: 'bob', percentage: 30 }] }
    renderUI(<ItemRow item={unevenItem} people={people} onChange={onChange} onDelete={() => {}} {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit pizza/i }))
    await userEvent.click(screen.getByRole('button', { name: /equally split/i }))
    await userEvent.click(screen.getByRole('button', { name: /collapse item/i }))
    const result = onChange.mock.calls[0][0] as ReceiptItem
    expect(result.shares.find(s => s.personId === 'alice')?.percentage).toBe(50)
    expect(result.shares.find(s => s.personId === 'bob')?.percentage).toBe(50)
  })

  it('equal split button is disabled when there are no people', async () => {
    renderUI(<ItemRow item={item} people={[]} onChange={() => {}} onDelete={() => {}} {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit pizza/i }))
    expect(screen.getByRole('button', { name: /equally split/i })).toBeDisabled()
  })
})
