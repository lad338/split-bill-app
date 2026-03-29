import { describe, it, expect } from 'vitest'
import { generateMessage } from '../../src/utils/shareMessage'
import type { Receipt } from '../../src/types'

const base: Receipt = {
  id: 'r1', title: 'Dinner', createdAt: 0, updatedAt: 0,
  paidBy: 'bob',
  people: [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }],
  items: [],
  settlements: [{ id: 's1', fromPersonId: 'alice', toPersonId: 'bob', amount: 30, amountPaid: 0 }],
}

describe('generateMessage', () => {
  it('produces title + owe lines', () => {
    const msg = generateMessage(base)
    expect(msg).toContain('Dinner')
    expect(msg).toContain('Alice owes Bob $30.00')
  })

  it('uses settlement.amount directly (ignores amountPaid)', () => {
    const receipt = { ...base, settlements: [{ ...base.settlements[0], amountPaid: 10 }] }
    const msg = generateMessage(receipt)
    expect(msg).toContain('$30.00')
  })

  it('returns all settled message when no settlements', () => {
    const msg = generateMessage({ ...base, settlements: [] })
    expect(msg).toContain('All settled')
  })

  it('skips settlements with amount <= 0', () => {
    const receipt = { ...base, settlements: [{ ...base.settlements[0], amount: 0 }] }
    const msg = generateMessage(receipt)
    expect(msg).toContain('All settled')
  })
})
