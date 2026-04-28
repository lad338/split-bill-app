import { useState, useEffect } from 'react'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RestoreIcon from '@mui/icons-material/Restore';
import ShareTable from './ShareTable'
import { equalSplit } from '../../utils/shareUtils'
import { useToast } from '../../hooks/useToast'
import './ItemRow.css'
import type { ReceiptItem, Person } from '../../types'
import { formatPriceInput, getFormattedPrice } from '../../utils/price'

interface ItemRowProps {
  item: ReceiptItem
  people: Person[]
  onChange: (item: ReceiptItem) => void
  onDelete: (itemId: string) => void
  editingItemId: string | null
  onEditStart: (id: string) => void
  onEditEnd: () => void
  priceClassName?: string
}

export default function ItemRow({ item, people, onChange, onDelete, editingItemId, onEditStart, onEditEnd, priceClassName }: ItemRowProps) {
  const { showToast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [draft, setDraft] = useState(item)
  const [priceStr, setPriceStr] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [manualResetKey, setManualResetKey] = useState(0)

  const total = people.reduce((sum, p) => sum + (draft.shares.find(s => s.personId === p.id)?.percentage ?? 0), 0)
  const canSave = Math.abs(total - 100) < 0.01 && parseFloat(priceStr) > 0

  useEffect(() => {
    if (!isExpanded) {
      setDraft(item)
      setPriceStr('')
    }
  }, [item, isExpanded])

  function handleExpand() {
    if (!people.length) {
      showToast('Please add participants first', 'warning')
      return
    }

    setDraft(item)
    setPriceStr(item.price.toFixed(2))
    setIsExpanded(true)
    setShowDeleteConfirm(false)
    onEditStart(item.id)
  }

  function handleCollapse() {
    if (canSave) {
      onChange({ ...draft, price: parseFloat(priceStr) })
      showToast('Changes saved')
    }
    setIsExpanded(false)
    onEditEnd()
  }

  function handleReset() {
    setDraft(item)
    setPriceStr(getFormattedPrice(item.price) || '')
    setManualResetKey(k => k + 1)
  }

  function handleEqualSplit() {
    const splits = equalSplit(people.length)
    setDraft({ ...draft, shares: people.map((p, i) => ({ personId: p.id, percentage: splits[i] })) })
    setManualResetKey(k => k + 1)
  }

  const anotherIsEditing = editingItemId !== null && editingItemId !== item.id

  if (!isExpanded) {
    return (
      <button
        className={`item-row item-row--collapsed${anotherIsEditing ? ' item-row--disabled' : ''}`}
        onClick={anotherIsEditing ? undefined : handleExpand}
        disabled={anotherIsEditing}
        aria-label={`Edit ${item.name}`}
      >
        <span className="item-row-name">{item.name}</span>
        <div className="item-row-right">
          <span className={`item-row-price${priceClassName ? ' ' + priceClassName : ''}`}>{getFormattedPrice(item.price)}</span>
          <ExpandMoreIcon fontSize="small" className="item-row-chevron" sx={{ color: 'var(--color-text-muted)' }} />
        </div>
      </button>
    )
  }

  const inputSx = {
    '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border)' },
    '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent)' },
    '& .MuiInputBase-input': {
      color: 'var(--color-text)',
      fontSize: 'var(--font-size-base)',
      fontWeight: 500,
      fontFamily: 'inherit',
      padding: '4px 0',
    },
  };

  return (
    <div className="item-row item-row--expanded">
      <div className="item-row-expand-header">
        <TextField
          variant="standard"
          value={draft.name}
          onChange={e => setDraft({ ...draft, name: e.target.value })}
          inputProps={{ 'aria-label': 'Item name', maxLength: 100 }}
          size="small"
          sx={{
            flex: 1,
            ...inputSx
          }}
        />
        <div className="item-row-right">
          <TextField
            variant="standard"
            placeholder="0.00"
            value={priceStr}
            onChange={e => setPriceStr(formatPriceInput(e.target.value))}
            inputProps={{ inputMode: 'decimal', step: '0.01', 'aria-label': 'Item price', style: { textAlign: 'right', width: 60 } }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            size="small"
            sx={inputSx}
          />
          <IconButton size="small" aria-label="Collapse item" onClick={handleCollapse} className="item-icon-btn">
            <ExpandMoreIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
          </IconButton>
        </div>
      </div>

      <div className="item-row-expand-body">
        <ShareTable
          people={people}
          shares={draft.shares}
          onChange={shares => setDraft({ ...draft, shares })}
          onEqualSplit={handleEqualSplit}
          manualResetKey={manualResetKey}
        />

        {showDeleteConfirm ? (
          <div className="item-row-actions item-row-actions--confirm">
            <span className="item-delete-confirm-label">Delete item?</span>
            <IconButton size="small" aria-label="Confirm delete" onClick={() => onDelete(item.id)} className="item-icon-btn item-icon-btn--danger">
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="Cancel delete" onClick={() => setShowDeleteConfirm(false)} className="item-icon-btn">
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        ) : (
          <div className="item-row-actions">
            <IconButton size="small" aria-label="Delete item" onClick={() => setShowDeleteConfirm(true)} className="item-icon-btn item-icon-btn--danger">
              <DeleteIcon fontSize="small" />
            </IconButton>
            <div className="item-row-actions-right">
              <IconButton size="small" aria-label="Reset item" onClick={handleReset} className="item-icon-btn">
                <RestoreIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
