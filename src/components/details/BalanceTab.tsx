import { useMemo } from 'react'
import { calculateSettlements } from '../../services/balance'
import BalanceRow from './BalanceRow'
import SharePanel from './SharePanel'
import './BalanceTab.css'
import type { Receipt } from '../../types'

interface BalanceTabProps {
  receipt: Receipt
  onChange: (receipt: Receipt) => void
}

export default function BalanceTab({ receipt, onChange: _onChange }: BalanceTabProps) {
  const settlements = useMemo(() => calculateSettlements(receipt), [receipt])

  if (receipt.people.length === 0) {
    return <p className="balance-tab-empty">Add people first.</p>
  }

  return (
    <div className="balance-tab">
      {settlements.length === 0 && (
        <p className="balance-tab-empty">No balances yet.</p>
      )}
      {settlements.map(s => (
        <BalanceRow key={s.id} settlement={s} people={receipt.people} />
      ))}
      <SharePanel receipt={{ ...receipt, settlements }} />
    </div>
  )
}
