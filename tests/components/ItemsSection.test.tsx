import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToastProvider } from '../../src/hooks/useToast'
import ItemsSection from '../../src/components/details/ItemsSection'
import type { Receipt } from '../../src/types'

const theme = createTheme()
function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}><ToastProvider>{children}</ToastProvider></ThemeProvider>
}
function renderUI(ui: React.ReactElement) { return render(ui, { wrapper: Wrapper }) }

const baseReceipt: Receipt = {
  id: 'r1', title: 'Dinner', createdAt: 0, updatedAt: 0,
  paidBy: 'alice',
  people: [{ id: 'alice', name: 'Alice' }],
  items: [
    { id: 'i1', name: 'Pizza', price: 20, shares: [{ personId: 'alice', percentage: 100 }] },
    { id: 'i2', name: 'Salad', price: 10, shares: [] },
  ],
  settlements: [],
}

describe('ItemsSection', () => {
  it('renders item names', () => {
    renderUI(<ItemsSection receipt={baseReceipt} onChange={() => {}} showAddForm={false} onAddFormClose={() => {}} onAddItem={() => {}} highlightErrors={false} />)
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('Salad')).toBeInTheDocument()
  })

  it('renders add item button', () => {
    renderUI(<ItemsSection receipt={baseReceipt} onChange={() => {}} showAddForm={false} onAddFormClose={() => {}} onAddItem={() => {}} highlightErrors={false} />)
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument()
  })

  it('shows add item form when showAddForm is true', () => {
    renderUI(<ItemsSection receipt={baseReceipt} onChange={() => {}} showAddForm={true} onAddFormClose={() => {}} onAddItem={() => {}} highlightErrors={false} />)
    expect(screen.getByRole('textbox', { name: /new item name/i })).toBeInTheDocument()
  })

  it('calls onChange with new item and onAddFormClose on confirm', async () => {
    const onChange = vi.fn()
    const onAddFormClose = vi.fn()
    renderUI(<ItemsSection receipt={baseReceipt} onChange={onChange} showAddForm={true} onAddFormClose={onAddFormClose} onAddItem={() => {}} highlightErrors={false} />)
    await userEvent.type(screen.getByRole('textbox', { name: /new item name/i }), 'Burger')
    await userEvent.type(screen.getByRole('textbox', { name: /new item price/i }), '12')
    await userEvent.click(screen.getByRole('button', { name: /confirm add item/i }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      items: expect.arrayContaining([expect.objectContaining({ name: 'Burger', price: 12 })]),
    }))
    expect(onAddFormClose).toHaveBeenCalled()
  })

  it('applies accent color class to 100%-allocated item price', () => {
    renderUI(<ItemsSection receipt={baseReceipt} onChange={() => {}} showAddForm={false} onAddFormClose={() => {}} onAddItem={() => {}} highlightErrors={false} />)
    const prices = document.querySelectorAll('.item-price--full')
    expect(prices.length).toBeGreaterThan(0)
  })

  it('applies error color class to partial item price when highlightErrors=true', () => {
    renderUI(<ItemsSection receipt={baseReceipt} onChange={() => {}} showAddForm={false} onAddFormClose={() => {}} onAddItem={() => {}} highlightErrors={true} />)
    const errorPrices = document.querySelectorAll('.item-price--error')
    expect(errorPrices.length).toBeGreaterThan(0)
  })
})
