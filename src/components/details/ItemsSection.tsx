import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import CheckIcon from '@mui/icons-material/Check'
import ItemRow from './ItemRow'
import { useToast } from '../../hooks/useToast'
import './ItemsSection.css'
import type { Receipt, ReceiptItem, Person } from '../../types'
import { formatPriceInput } from '../../utils/price'

interface AddItemFormProps {
  people: Person[]
  onSubmit: (item: ReceiptItem) => void
}

function AddItemForm({ people: _people, onSubmit }: AddItemFormProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const canSubmit = name.trim().length > 0 && parseFloat(price) > 0

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({ id: crypto.randomUUID(), name: name.trim(), price: parseFloat(price), shares: [] })
    setName('')
    setPrice('')
  }

  return (
    <div className="add-item-form">
      <TextField
        variant="standard"
        placeholder="Item name"
        value={name}
        onChange={e => setName(e.target.value)}
        inputProps={{ maxLength: 100, 'aria-label': 'New item name' }}
        size="small"
        sx={{
          flex: 1,
          '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border)' },
          '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent)' },
          '& .MuiInputBase-input': { color: 'var(--color-text)', fontSize: 'var(--font-size-base)', fontWeight: 500, fontFamily: 'inherit', padding: '4px 0' },
        }}
      />
      <TextField
        variant="standard"
        placeholder="0.00"
        value={price}
        onChange={e => setPrice(formatPriceInput(e.target.value))}
        inputProps={{ inputMode: 'decimal', step: '0.01', 'aria-label': 'New item price', style: { textAlign: 'right', width: 60 } }}
        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        size="small"
        sx={{
          '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border)' },
          '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent)' },
          '& .MuiInputBase-input': { color: 'var(--color-text)', fontSize: 'var(--font-size-base)', fontFamily: 'inherit' },
        }}
      />
      <IconButton size="small" aria-label="Confirm add item" onClick={handleSubmit} disabled={!canSubmit} className="item-icon-btn item-icon-btn--save">
        <CheckIcon fontSize="small" />
      </IconButton>
    </div>
  )
}

interface ItemsSectionProps {
  receipt: Receipt
  onChange: (receipt: Receipt) => void
  highlightErrors: boolean
}

export default function ItemsSection({ receipt, onChange, highlightErrors }: ItemsSectionProps) {
  const { showToast } = useToast()
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  function priceClass(item: ReceiptItem): string {
    const total = item.shares.reduce((sum, s) => sum + s.percentage, 0)
    const isFull = Math.abs(total - 100) < 0.01
    if (isFull) return 'item-price--full'
    if (highlightErrors) return 'item-price--partial item-price--error'
    return 'item-price--partial'
  }

  function updateItem(updated: ReceiptItem) {
    onChange({ ...receipt, items: receipt.items.map(i => i.id === updated.id ? updated : i) })
  }

  function deleteItem(itemId: string) {
    if (editingItemId === itemId) setEditingItemId(null)
    onChange({ ...receipt, items: receipt.items.filter(i => i.id !== itemId) })
  }

  return (
    <div className="items-section">
      <div className="items-add-row">
        <button className="items-add-btn" aria-label="Add item" onClick={() => setShowAddForm(v => !v)}>
          {showAddForm ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
          Add item
        </button>
        {showAddForm && (
          <div className="items-add-form-body">
            <AddItemForm
              people={receipt.people}
              onSubmit={item => {
                onChange({ ...receipt, items: [item, ...receipt.items] })
                setShowAddForm(false)
                showToast('Item added')
              }}
            />
          </div>
        )}
      </div>
      {receipt.items.length === 0 && !showAddForm && (
        <p className="items-empty">No items found.</p>
      )}
      {receipt.items.map(item => (
        <ItemRow
          key={item.id}
          item={item}
          people={receipt.people}
          onChange={updateItem}
          onDelete={deleteItem}
          editingItemId={editingItemId}
          onEditStart={id => setEditingItemId(id)}
          onEditEnd={() => setEditingItemId(null)}
          priceClassName={priceClass(item)}
        />
      ))}
    </div>
  )
}
