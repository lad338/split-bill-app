import type { Receipt } from '../types'

export function generateMessage(receipt: Receipt): string {
  const payer = receipt.people.find(p => p.id === receipt.paidBy)?.name ?? 'Unknown'
  const lines = receipt.settlements
    .filter(s => s.amount > 0)
    .map(s => {
      const from = receipt.people.find(p => p.id === s.fromPersonId)?.name ?? '?'
      return `${from} owes ${payer} $${s.amount.toFixed(2)}`
    })
  return lines.length > 0
    ? `${receipt.title}\n\n${lines.join('\n')}`
    : `${receipt.title}\n\nAll settled! 🎉`
}
