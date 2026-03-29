import { useRef, useLayoutEffect, useState } from 'react'
import Chip from '@mui/material/Chip'
import dayjs from 'dayjs'
import './ReceiptCard.css'
import type { Receipt } from '../../types'

interface ReceiptCardProps {
  receipt: Receipt
  onClick: () => void
}

export default function ReceiptCard({ receipt, onClick }: ReceiptCardProps) {
  const dateTs = receipt.date ?? receipt.createdAt
  const dateStr = dayjs(dateTs).format('YYYY/MM/DD')
  const total = receipt.items.reduce((sum, item) => sum + item.price, 0)
  const names = receipt.people.map(p => p.name)

  const chipsRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(names.length)

  useLayoutEffect(() => {
    setVisibleCount(names.length)
  }, [names.length])

  useLayoutEffect(() => {
    const el = chipsRef.current
    if (!el || names.length === 0) return
    if (el.scrollWidth <= el.clientWidth + 1) return

    const containerRight = el.getBoundingClientRect().right
    const chipEls = Array.from(el.querySelectorAll('.receipt-chip')) as HTMLElement[]
    let count = 0
    for (const chip of chipEls) {
      if (chip.getBoundingClientRect().right > containerRight - 20) break
      count++
    }
    setVisibleCount(count)
  }, [names, visibleCount])

  const showEllipsis = visibleCount < names.length

  return (
    <button className="receipt-card" onClick={onClick}>
      <div className="receipt-card-main">
        <div className="receipt-card-row1">
          <span className="receipt-card-title">{receipt.title || 'Untitled Receipt'}</span>
          <span className="receipt-card-total">${total.toFixed(2)}</span>
        </div>
        <div className="receipt-card-meta">
          {dateStr} · {names.length} {names.length === 1 ? 'person' : 'people'}
        </div>
        {names.length > 0 && (
          <div ref={chipsRef} className="receipt-card-chips">
            {names.slice(0, visibleCount).map(name => (
              <span key={name} className="receipt-chip">
                <Chip
                  label={name}
                  variant="outlined"
                  size="small"
                  sx={{
                    color: 'var(--color-text-accent)',
                    borderColor: 'var(--color-border)',
                    fontSize: '11px',
                    height: '20px',
                    '& .MuiChip-label': { px: '8px' },
                  }}
                />
              </span>
            ))}
            {showEllipsis && (
              <span className="receipt-card-chips-more">...</span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
