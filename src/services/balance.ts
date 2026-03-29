import { nanoid } from 'nanoid'
import type { Receipt, Settlement } from '../types'

export function calculateSettlements(receipt: Receipt): Settlement[] {
  const { items, paidBy, settlements: existing, tax = 0, tips = 0, discount = 0 } = receipt

  if (!paidBy) return []

  const subtotal = items.reduce((sum, i) => sum + i.price, 0)
  const multiplier = subtotal > 0 ? 1 + (tax + tips - discount) / subtotal : 1

  const owedMap: Record<string, number> = {}
  for (const item of items) {
    for (const share of item.shares) {
      if (share.personId === paidBy) continue
      owedMap[share.personId] = (owedMap[share.personId] ?? 0) +
        (item.price * share.percentage) / 100
    }
  }

  return Object.entries(owedMap)
    .filter(([, amount]) => amount > 0.001)
    .map(([personId, amount]) => {
      const prior = existing.find(
        s => s.fromPersonId === personId && s.toPersonId === paidBy
      )
      return {
        id: prior?.id ?? nanoid(),
        fromPersonId: personId,
        toPersonId: paidBy,
        amount: Math.round(amount * multiplier * 100) / 100,
        amountPaid: prior?.amountPaid ?? 0,
      }
    })
}
