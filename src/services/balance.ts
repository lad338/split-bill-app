import { nanoid } from 'nanoid'
import type { Receipt, Settlement } from '../types'

export function calculateSettlements(receipt: Receipt): Settlement[] {
  const { items, paidBy, settlements: existing } = receipt

  if (!paidBy) return []

  // Sum each non-payer's assigned cost across all items
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
        amount: Math.round(amount * 100) / 100,
        amountPaid: prior?.amountPaid ?? 0,
      }
    })
}
