import { useMemo } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { calculateSettlements } from '../../services/balance'
import BalanceRow from './BalanceRow'
import SharePanel from './SharePanel'
import './BalanceSection.css'
import type { Receipt } from '../../types'

interface BalanceSectionProps {
  receipt: Receipt
  onChange: (receipt: Receipt) => void
}

function isBalanceReady(receipt: Receipt): boolean {
  if (!receipt.paidBy) return false
  if (receipt.items.length === 0) return false
  return receipt.items.every(item => {
    const total = item.shares.reduce((sum, s) => sum + s.percentage, 0)
    return Math.abs(total - 100) < 0.01
  })
}

const inputSx = {
  '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border)' },
  '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent)' },
  '& .MuiInputBase-input': { color: 'var(--color-text)', fontSize: 'var(--font-size-base)', fontFamily: 'inherit' },
}

export default function BalanceSection({ receipt, onChange }: BalanceSectionProps) {
  const settlements = useMemo(() => calculateSettlements(receipt), [receipt])

  if (!isBalanceReady(receipt)) {
    const message = !receipt.paidBy
      ? 'Please set who paid in full and assign all item shares.'
      : 'Please assign all item shares before viewing the balance.'
    return (
      <div className="balance-section">
        <p className="balance-section-error">{message}</p>
      </div>
    )
  }

  function handleTipsChange(value: string) {
    const num = parseFloat(value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')) || 0
    onChange({ ...receipt, tips: num })
  }

  function handleTaxChange(value: string) {
    const num = parseFloat(value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')) || 0
    onChange({ ...receipt, tax: num })
  }

  return (
    <div className="balance-section">
      <div className="balance-section-inputs">
        <TextField
          variant="standard"
          label="Tax"
          value={receipt.tax ?? 0}
          onChange={e => handleTaxChange(e.target.value)}
          inputProps={{ inputMode: 'decimal', 'aria-label': 'Tax amount' }}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          size="small"
          sx={inputSx}
        />
        <TextField
          variant="standard"
          label="Tips"
          value={receipt.tips ?? 0}
          onChange={e => handleTipsChange(e.target.value)}
          inputProps={{ inputMode: 'decimal', 'aria-label': 'Tips amount' }}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          size="small"
          sx={inputSx}
        />
      </div>
      {settlements.length === 0 && (
        <p className="balance-section-empty">No balances yet.</p>
      )}
      {settlements.map(s => (
        <BalanceRow key={s.id} settlement={s} people={receipt.people} />
      ))}
      <SharePanel receipt={{ ...receipt, settlements }} />
    </div>
  )
}
