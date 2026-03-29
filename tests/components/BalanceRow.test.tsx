import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import BalanceRow from '../../src/components/details/BalanceRow'
import type { Settlement, Person } from '../../src/types'

const settlement: Settlement = {
  id: 's1', fromPersonId: 'alice', toPersonId: 'bob', amount: 50, amountPaid: 0,
}
const people: Person[] = [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }]

describe('BalanceRow', () => {
  it('shows "Alice owes Bob"', () => {
    render(<BalanceRow settlement={settlement} people={people} />)
    expect(screen.getByText(/Alice owes Bob/)).toBeInTheDocument()
  })

  it('shows amount in dollars', () => {
    render(<BalanceRow settlement={settlement} people={people} />)
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument()
  })

  it('renders nothing when amount is zero', () => {
    const { container } = render(<BalanceRow settlement={{ ...settlement, amount: 0 }} people={people} />)
    expect(container.firstChild).toBeNull()
  })

  it('does not render a Mark Paid button', () => {
    render(<BalanceRow settlement={settlement} people={people} />)
    expect(screen.queryByRole('button', { name: /mark paid/i })).not.toBeInTheDocument()
  })
})
