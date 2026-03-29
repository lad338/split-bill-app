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

describe('ItemRow', () => {
  it('shows item name in collapsed state', () => {
    renderUI(<ItemRow item={item} people={people} onChange={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('Pizza')).toBeInTheDocument()
  })

  it('does not show share inputs in collapsed state', () => {
    renderUI(<ItemRow item={item} people={people} onChange={() => {}} onDelete={() => {}} />)
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('expands when pencil icon is clicked', async () => {
    renderUI(<ItemRow item={item} people={people} onChange={() => {}} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('calls onChange with updated item on Save', async () => {
    const onChange = vi.fn()
    renderUI(<ItemRow item={item} people={people} onChange={onChange} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onChange).toHaveBeenCalledWith(item)
  })

  it('collapses without saving on Cancel', async () => {
    const onChange = vi.fn()
    renderUI(<ItemRow item={item} people={people} onChange={onChange} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const nameInput = screen.getByDisplayValue('Pizza')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Pasta')
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('Pizza')).toBeInTheDocument()
  })

  it('shows delete confirmation on Delete click', async () => {
    renderUI(<ItemRow item={item} people={people} onChange={() => {}} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel delete/i })).toBeInTheDocument()
  })

  it('calls onDelete after confirming delete', async () => {
    const onDelete = vi.fn()
    renderUI(<ItemRow item={item} people={people} onChange={() => {}} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm delete/i }))
    expect(onDelete).toHaveBeenCalledWith('item1')
  })

  it('Save button is disabled when share total ≠ 100%', async () => {
    const badItem: ReceiptItem = { ...item, shares: [{ personId: 'alice', percentage: 60 }] }
    renderUI(<ItemRow item={badItem} people={people} onChange={() => {}} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('equal split button distributes 100% equally among all people', async () => {
    const onChange = vi.fn()
    const unevenItem: ReceiptItem = { ...item, shares: [{ personId: 'alice', percentage: 20 }, { personId: 'bob', percentage: 30 }] }
    renderUI(<ItemRow item={unevenItem} people={people} onChange={onChange} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    await userEvent.click(screen.getByRole('button', { name: /equal split/i }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    const result = onChange.mock.calls[0][0] as ReceiptItem
    expect(result.shares.find(s => s.personId === 'alice')?.percentage).toBe(50)
    expect(result.shares.find(s => s.personId === 'bob')?.percentage).toBe(50)
  })

  it('equal split button is disabled when there are no people', async () => {
    renderUI(<ItemRow item={item} people={[]} onChange={() => {}} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByRole('button', { name: /equal split/i })).toBeDisabled()
  })
})
