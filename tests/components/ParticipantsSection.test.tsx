import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ParticipantsSection from '../../src/components/details/ParticipantsSection'
import type { Receipt } from '../../src/types'

vi.mock('../../src/hooks/usePeopleHistory', () => ({
  usePeopleHistory: () => ({ history: [], addName: vi.fn() }),
}))

const receipt: Receipt = {
  id: 'r1', title: 'Dinner', createdAt: 0, updatedAt: 0,
  paidBy: undefined,
  people: [{ id: 'alice', name: 'Alice' }],
  items: [{ id: 'i1', name: 'Pizza', price: 20, shares: [{ personId: 'alice', percentage: 100 }] }],
  settlements: [],
}

describe('ParticipantsSection', () => {
  it('renders people input and who paid select', () => {
    render(<ParticipantsSection receipt={receipt} onChange={() => {}} highlightErrors={false} />)
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
    expect(screen.getByText(/who paid/i)).toBeInTheDocument()
  })

  it('colors "Who paid in full" label red when highlightErrors=true and paidBy is unset', () => {
    render(<ParticipantsSection receipt={receipt} onChange={() => {}} highlightErrors={true} />)
    const label = screen.getByText(/who paid/i)
    expect(label).toHaveClass('participants-who-paid-label--error')
  })

  it('does not color label red when paidBy is set even with highlightErrors=true', () => {
    const paidReceipt = { ...receipt, paidBy: 'alice' }
    render(<ParticipantsSection receipt={paidReceipt} onChange={() => {}} highlightErrors={true} />)
    const label = screen.getByText(/who paid/i)
    expect(label).not.toHaveClass('participants-who-paid-label--error')
  })

  it('restores share percentages when a deleted person is re-added by name', async () => {
    const item = { id: 'i1', name: 'Pizza', price: 20, shares: [{ personId: 'alice', percentage: 60 }, { personId: 'bob', percentage: 40 }] }
    const twoPersonReceipt: Receipt = { id: 'r1', title: 'Test', createdAt: 0, updatedAt: 0, people: [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], items: [item], settlements: [] }
    const onChange = vi.fn()
    const { rerender } = render(<ParticipantsSection receipt={twoPersonReceipt} onChange={onChange} highlightErrors={false} />)

    await userEvent.click(screen.getByTitle('Remove Alice'))

    const receiptWithoutAlice = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Receipt
    rerender(<ParticipantsSection receipt={receiptWithoutAlice} onChange={onChange} highlightErrors={false} />)

    const input = screen.getAllByRole('combobox')[0]
    await userEvent.type(input, 'Alice')
    await userEvent.keyboard('{Enter}')

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Receipt
    const aliceId = lastCall.people.find(p => p.name === 'Alice')?.id
    const aliceShare = lastCall.items[0].shares.find(s => s.personId === aliceId)?.percentage
    expect(aliceShare).toBe(60)
  })
})
