import { describe, it, expect } from 'vitest'
import { calculateSettlements } from '../../src/services/balance'
import type { Receipt, Person } from '../../src/types'

const alice: Person = { id: 'alice', name: 'Alice' }
const bob: Person = { id: 'bob', name: 'Bob' }
const carol: Person = { id: 'carol', name: 'Carol' }

function makeReceipt(overrides: Partial<Receipt> = {}): Receipt {
  return {
    id: 'r1', title: 'Test', createdAt: 0, updatedAt: 0,
    paidBy: 'bob',
    people: [alice, bob],
    items: [],
    settlements: [],
    ...overrides,
  }
}

describe('calculateSettlements', () => {
  it('returns empty array when no items', () => {
    expect(calculateSettlements(makeReceipt())).toEqual([])
  })

  it('returns empty when payer consumed 100% of items', () => {
    const receipt = makeReceipt({
      items: [{ id: 'i1', name: 'Pizza', price: 20, shares: [{ personId: 'bob', percentage: 100 }] }],
    })
    expect(calculateSettlements(receipt)).toEqual([])
  })

  it('alice owes bob full item cost when bob paid and alice took 100%', () => {
    const receipt = makeReceipt({
      items: [{ id: 'i1', name: 'Steak', price: 50, shares: [{ personId: 'alice', percentage: 100 }] }],
    })
    const result = calculateSettlements(receipt)
    expect(result).toHaveLength(1)
    expect(result[0].fromPersonId).toBe('alice')
    expect(result[0].toPersonId).toBe('bob')
    expect(result[0].amount).toBeCloseTo(50)
  })

  it('calculates proportional amount for partial share', () => {
    const receipt = makeReceipt({
      items: [{
        id: 'i1', name: 'Dinner', price: 100,
        shares: [{ personId: 'alice', percentage: 60 }, { personId: 'bob', percentage: 40 }],
      }],
    })
    const result = calculateSettlements(receipt)
    expect(result).toHaveLength(1)
    expect(result[0].fromPersonId).toBe('alice')
    expect(result[0].amount).toBeCloseTo(60)
  })

  it('generates one settlement per non-payer person', () => {
    const receipt = makeReceipt({
      people: [alice, bob, carol],
      items: [{
        id: 'i1', name: 'Drinks', price: 90,
        shares: [
          { personId: 'alice', percentage: 33 },
          { personId: 'carol', percentage: 33 },
          { personId: 'bob', percentage: 34 },
        ],
      }],
    })
    const result = calculateSettlements(receipt)
    expect(result).toHaveLength(2)
    expect(result.every(s => s.toPersonId === 'bob')).toBe(true)
  })

  it('preserves existing amountPaid from prior settlements', () => {
    const receipt = makeReceipt({
      items: [{ id: 'i1', name: 'Lunch', price: 40, shares: [{ personId: 'alice', percentage: 100 }] }],
      settlements: [{ id: 's1', fromPersonId: 'alice', toPersonId: 'bob', amount: 40, amountPaid: 15 }],
    })
    const result = calculateSettlements(receipt)
    expect(result[0].amountPaid).toBe(15)
  })

  it('applies tax and tips multiplier proportionally', () => {
    // subtotal=100, multiplier = 1 + 10/100 + 15/100 = 1.25 → alice owes 50 * 1.25 = 62.50
    const receipt = makeReceipt({
      items: [{ id: 'i1', name: 'Dinner', price: 100, shares: [{ personId: 'alice', percentage: 50 }, { personId: 'bob', percentage: 50 }] }],
      tax: 10,
      tips: 15,
    })
    const result = calculateSettlements(receipt)
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(62.5)
  })

  it('applies only tax when tips is absent', () => {
    // subtotal=100, multiplier = 1.20 → alice owes 60
    const receipt = makeReceipt({
      items: [{ id: 'i1', name: 'Dinner', price: 100, shares: [{ personId: 'alice', percentage: 50 }, { personId: 'bob', percentage: 50 }] }],
      tax: 20,
    })
    const result = calculateSettlements(receipt)
    expect(result[0].amount).toBe(60)
  })

  it('does not divide by zero when subtotal is 0', () => {
    const receipt = makeReceipt({ items: [], tax: 10, tips: 5 })
    expect(calculateSettlements(receipt)).toEqual([])
  })
})
