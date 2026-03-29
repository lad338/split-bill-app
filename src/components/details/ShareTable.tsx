import { useState, useEffect } from 'react'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { equalSplit } from '../../utils/shareUtils'
import './ShareTable.css'
import type { Person, ItemShare } from '../../types'

interface ShareTableProps {
  people: Person[]
  shares: ItemShare[]
  onChange: (shares: ItemShare[]) => void
  onEqualSplit: () => void
}

interface ShareRowProps {
  person: Person
  percentage: number
  onUpdate: (personId: string, value: number) => void
  onSetFull: (personId: string) => void
  onToggle: (personId: string) => void
}

function ShareRow({ person, percentage, onUpdate, onSetFull, onToggle }: ShareRowProps) {
  const [inputVal, setInputVal] = useState(String(percentage))
  const isIncluded = percentage > 0

  useEffect(() => {
    setInputVal(String(percentage))
  }, [percentage])

  return (
    <div className="share-row">
      <Tooltip title={isIncluded ? `Exclude ${person.name}` : `Include ${person.name}`} disableInteractive>
        <IconButton
          size="small"
          aria-label={isIncluded ? `Exclude ${person.name}` : `Include ${person.name}`}
          onClick={() => onToggle(person.id)}
          className={isIncluded ? 'share-user-btn share-user-btn--included' : 'share-user-btn share-user-btn--excluded'}
        >
          {isIncluded
            ? <CheckBoxIcon sx={{ fontSize: 18 }} />
            : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />
          }
        </IconButton>
      </Tooltip>
      <span className="share-name">{person.name}</span>
      <div className="share-row-controls">
        <button
          className="share-shortcut-btn"
          aria-label={`${person.name} 100%`}
          onClick={() => onSetFull(person.id)}
        >
          100%
        </button>
        <TextField
          variant="standard"
          value={inputVal}
          onChange={e => {
            const raw = e.target.value
            setInputVal(raw)
            const val = Math.round(Math.min(100, Math.max(0, parseFloat(raw) || 0)) * 100) / 100
            onUpdate(person.id, val)
          }}
          inputProps={{
            inputMode: 'decimal',
            step: '0.01',
            'aria-label': `${person.name} percentage`,
            style: { textAlign: 'right', width: 36 },
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end" sx={{ '& p': { color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' } }}>%</InputAdornment>,
          }}
          size="small"
          sx={{
            '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border)' },
            '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent)' },
            '& .MuiInputBase-input': {
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-base)',
              fontFamily: 'inherit',
              padding: '2px 0',
            },
          }}
        />
      </div>
    </div>
  )
}

export default function ShareTable({ people, shares, onChange, onEqualSplit }: ShareTableProps) {
  function pct(personId: string): number {
    return shares.find(s => s.personId === personId)?.percentage ?? 0
  }

  function allShares(): ItemShare[] {
    return people.map(p => ({ personId: p.id, percentage: pct(p.id) }))
  }

  const total = people.reduce((sum, p) => sum + pct(p.id), 0)

  function updatePercentage(personId: string, value: number) {
    onChange(allShares().map(s => s.personId === personId ? { ...s, percentage: value } : s))
  }

  function setFull(personId: string) {
    onChange(allShares().map(s => ({ ...s, percentage: s.personId === personId ? 100 : 0 })))
  }

  function exclude(personId: string) {
    const current = allShares()
    const active = current.filter(s => s.personId !== personId && s.percentage > 0)
    const splits = equalSplit(active.length)
    let idx = 0
    onChange(current.map(s => {
      if (s.personId === personId) return { ...s, percentage: 0 }
      if (s.percentage > 0) return { ...s, percentage: splits[idx++] }
      return s
    }))
  }

  function include(personId: string) {
    const current = allShares()
    const activeIds = new Set(
      current.filter(s => s.percentage > 0 || s.personId === personId).map(s => s.personId)
    )
    const splits = equalSplit(activeIds.size)
    let idx = 0
    onChange(current.map(s =>
      activeIds.has(s.personId) ? { ...s, percentage: splits[idx++] } : s
    ))
  }

  function toggle(personId: string) {
    const current = allShares()
    const isIncluded = (current.find(s => s.personId === personId)?.percentage ?? 0) > 0
    if (isIncluded) exclude(personId)
    else include(personId)
  }

  return (
    <div className="share-table">
      {people.map(person => (
        <ShareRow
          key={person.id}
          person={person}
          percentage={pct(person.id)}
          onUpdate={updatePercentage}
          onSetFull={setFull}
          onToggle={toggle}
        />
      ))}
      <div className="share-total-row">
        <button
          className="share-equally-split-btn"
          onClick={onEqualSplit}
          disabled={people.length === 0}
          aria-label="Equally split"
        >
          Equally split
        </button>
        <span className={`share-total${Math.abs(total - 100) > 0.01 ? ' share-total--error' : ''}`}>
          Total: {total.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}
