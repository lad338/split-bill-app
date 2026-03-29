import { useState, useEffect } from 'react'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import CallSplitIcon from '@mui/icons-material/CallSplit'
import ShareTable from './ShareTable'
import { equalSplit } from '../../utils/shareUtils'
import { useToast } from '../../hooks/useToast'
import './ItemRow.css'
import type { ReceiptItem, Person } from '../../types'

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

  const total = people.reduce((sum, p) => sum + (draft.shares.find(s => s.personId === p.id)?.percentage ?? 0), 0)
  const canSave = Math.abs(total - 100) < 0.01 && parseFloat(priceStr) > 0

  useEffect(() => {
    if (!isExpanded) {
      setDraft(item)
      setPriceStr('')
    }
  }, [item, isExpanded])

  function handleEdit() {
    setDraft(item)
    setPriceStr(item.price.toFixed(2))
    setIsExpanded(true)
    setShowDeleteConfirm(false)
    onEditStart(item.id)
  }

  function handleSave() {
    onChange({ ...draft, price: parseFloat(priceStr) })
    setIsExpanded(false)
    onEditEnd()
    showToast('Changes saved')
  }

  function handleCancel() {
    setDraft(item)
    setPriceStr('')
    setIsExpanded(false)
    setShowDeleteConfirm(false)
    onEditEnd()
  }

  function handleEqualSplit() {
    const splits = equalSplit(people.length)
    setDraft({ ...draft, shares: people.map((p, i) => ({ personId: p.id, percentage: splits[i] })) })
  }

  const anotherIsEditing = editingItemId !== null && editingItemId !== item.id

  if (!isExpanded) {
    return (
      <div className="item-row">
        <span className="item-row-name">{item.name}</span>
        <div className="item-row-right">
          <span className={`item-row-price${priceClassName ? ' ' + priceClassName : ''}`}>${item.price.toFixed(2)}</span>
          <IconButton
            size="small"
            aria-label="Edit item"
            onClick={handleEdit}
            disabled={anotherIsEditing}
            className="item-icon-btn"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    )
  }

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
            '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border)' },
            '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent)' },
            '& .MuiInputBase-input': {
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              fontFamily: 'inherit',
              padding: '4px 0',
            },
          }}
        />
        <div className="item-row-right">
          <TextField
            variant="standard"
            placeholder="0.00"
            value={priceStr}
            onChange={e => setPriceStr(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
            inputProps={{ inputMode: 'decimal', step: '0.01', 'aria-label': 'Item price', style: { textAlign: 'right', width: 60 } }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            size="small"
            sx={{
              '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border)' },
              '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent)' },
              '& .MuiInputBase-input': { color: 'var(--color-text)', fontSize: 'var(--font-size-base)', fontFamily: 'inherit' },
            }}
          />
          <IconButton
            size="small"
            aria-label="Equal split"
            onClick={handleEqualSplit}
            disabled={people.length === 0}
            className="item-icon-btn"
          >
            <CallSplitIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      <div className="item-row-expand-body">
        <ShareTable
          people={people}
          shares={draft.shares}
          onChange={shares => setDraft({ ...draft, shares })}
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
              <IconButton size="small" aria-label="Cancel" onClick={handleCancel} className="item-icon-btn">
                <CloseIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="Save" onClick={handleSave} disabled={!canSave} className="item-icon-btn item-icon-btn--save">
                <CheckIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
