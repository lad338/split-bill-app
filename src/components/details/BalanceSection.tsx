import { useMemo, useState, useEffect, useRef } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { calculateSettlements } from '../../services/balance'
import BalanceRow from './BalanceRow'
import SharePanel from './SharePanel'
import './BalanceSection.css'
import type { Receipt } from '../../types'
import { parsePrice } from '../../utils/price'

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

  const [taxValue, setTaxValue] = useState(receipt.tax ? String(receipt.tax): undefined)
  const [tipsValue, setTipsValue] = useState(receipt.tips ? String(receipt.tips) : undefined)
  const [discountValue, setDiscountValue] = useState(receipt.discount ? String(receipt.discount) : undefined)
  const taxDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tipsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const discountDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setTaxValue(String(receipt.tax ?? 0)) }, [receipt.tax])
  useEffect(() => { setTipsValue(String(receipt.tips ?? 0)) }, [receipt.tips])
  useEffect(() => { setDiscountValue(String(receipt.discount ?? 0)) }, [receipt.discount])

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
    setTipsValue(value)
    if (tipsDebounceRef.current) clearTimeout(tipsDebounceRef.current)
    tipsDebounceRef.current = setTimeout(() => {
      const num = parsePrice(value)
      onChange({ ...receipt, tips: num })
    }, 300)
  }

  function handleTaxChange(value: string) {
    setTaxValue(value)
    if (taxDebounceRef.current) clearTimeout(taxDebounceRef.current)
    taxDebounceRef.current = setTimeout(() => {
      const num = parsePrice(value)
      onChange({ ...receipt, tax: num })
    }, 300)
  }

  function handleDiscountChange(value: string) {
    setDiscountValue(value)
    if (discountDebounceRef.current) clearTimeout(discountDebounceRef.current)
    discountDebounceRef.current = setTimeout(() => {
      const num = parsePrice(value)
      onChange({ ...receipt, discount: num })
    }, 300)
  }

  return (
    <div className="balance-section">
      <div className="balance-section-inputs">
        <TextField
          variant="standard"
          label="Tax"
          value={taxValue}
          onChange={e => handleTaxChange(e.target.value)}
          inputProps={{ inputMode: 'decimal', step: '0.01', 'aria-label': 'Tax amount' }}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          size="small"
          sx={inputSx}
        />
        <TextField
          variant="standard"
          label="Tips"
          value={tipsValue}
          onChange={e => handleTipsChange(e.target.value)}
          inputProps={{ inputMode: 'decimal', step: '0.01', 'aria-label': 'Tips amount' }}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          size="small"
          sx={inputSx}
        />
        <TextField
          variant="standard"
          label="Discount"
          value={discountValue}
          onChange={e => handleDiscountChange(e.target.value)}
          inputProps={{ inputMode: 'decimal', step: '0.01', 'aria-label': 'Discount amount' }}
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
