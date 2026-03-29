import { useState } from 'react'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { usePeopleHistory } from '../../hooks/usePeopleHistory'
import PeopleInput from './PeopleInput'
import './ParticipantsSection.css'
import type { Receipt, Person } from '../../types'

interface ParticipantsSectionProps {
  receipt: Receipt
  onChange: (receipt: Receipt) => void
  highlightErrors: boolean
}

export default function ParticipantsSection({ receipt, onChange, highlightErrors }: ParticipantsSectionProps) {
  const { history, addName } = usePeopleHistory()
  const [deletedShares, setDeletedShares] = useState<Map<string, { itemId: string; percentage: number }[]>>(
    () => new Map()
  )

  function handlePeopleChange(newPeople: Person[]) {
    const removed = receipt.people.filter(p => !newPeople.some(np => np.id === p.id))
    const added = newPeople.filter(np => !receipt.people.some(p => p.id === np.id))
    const updatedDeleted = new Map(deletedShares)

    removed.forEach(person => {
      const shares = receipt.items.map(item => ({
        itemId: item.id,
        percentage: item.shares.find(s => s.personId === person.id)?.percentage ?? 0,
      }))
      updatedDeleted.set(person.name.toLowerCase(), shares)
    })
    setDeletedShares(updatedDeleted)

    let updatedItems = receipt.items
    added.forEach(person => {
      const saved = updatedDeleted.get(person.name.toLowerCase())
      if (!saved) return
      updatedItems = updatedItems.map(item => {
        const savedShare = saved.find(s => s.itemId === item.id)
        if (!savedShare || savedShare.percentage === 0) return item
        const currentShare = item.shares.find(s => s.personId === person.id)
        if (currentShare && currentShare.percentage !== 0) return item
        const newShares = item.shares.filter(s => s.personId !== person.id)
        return { ...item, shares: [...newShares, { personId: person.id, percentage: savedShare.percentage }] }
      })
    })

    onChange({ ...receipt, people: newPeople, items: updatedItems })
  }

  const whoPaidError = highlightErrors && !receipt.paidBy

  return (
    <div className="participants-section">
      <PeopleInput
        people={receipt.people}
        suggestions={history}
        onChange={handlePeopleChange}
        onAddName={addName}
      />
      <FormControl variant="standard" fullWidth>
        <InputLabel className="participants-who-paid-label" sx={{ '&.MuiInputLabel-root': { color: whoPaidError ? 'var(--color-text-danger)' : 'var(--color-text-muted)', fontFamily: 'inherit', transition: 'color 0.15s' } }}>
          Who paid in full
        </InputLabel>
        <Select
          value={receipt.paidBy ?? ''}
          onChange={e => {
            const val = e.target.value as string
            onChange({ ...receipt, paidBy: val || undefined })
          }}
          sx={{
            color: 'var(--color-text)',
            fontFamily: 'inherit',
            '&:before': { borderBottomColor: 'var(--color-border)' },
            '&:after': { borderBottomColor: 'var(--color-accent)' },
            '& .MuiSelect-icon': { color: 'var(--color-text-muted)' },
          }}
        >
          {receipt.people.map(p => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
