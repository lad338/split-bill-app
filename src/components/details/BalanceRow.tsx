import './BalanceRow.css'
import type { Settlement, Person } from '../../types'
import { getFormattedPrice } from '../../utils/price'

interface BalanceRowProps {
  settlement: Settlement
  people: Person[]
}

export default function BalanceRow({ settlement, people }: BalanceRowProps) {
  if (settlement.amount <= 0) return null

  const from = people.find(p => p.id === settlement.fromPersonId)?.name ?? 'Unknown'
  const to = people.find(p => p.id === settlement.toPersonId)?.name ?? 'Unknown'

  return (
    <div className="balance-row">
      <span className="balance-row-label">{from} owes {to}</span>
      <span className="balance-row-amount">{getFormattedPrice(settlement.amount)}</span>
    </div>
  )
}
