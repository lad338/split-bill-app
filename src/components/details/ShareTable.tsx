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
  manualResetKey?: number
}

interface ShareRowProps {
  person: Person
  percentage: number
  onUpdate: (personId: string, value: number) => void
  onSetFull: (personId: string) => void
  onToggle: (personId: string) => void
}

function redistributeAuto(
  shares: ItemShare[],
  manuallySet: Set<string>,
  people: Person[]
): ItemShare[] {
  const manualSum = [...manuallySet].reduce(
    (sum, id) => sum + (shares.find(s => s.personId === id)?.percentage ?? 0),
    0
  )
  const remaining = 100 - manualSum
  const autoActive = people.filter(
    p => !manuallySet.has(p.id) && (shares.find(s => s.personId === p.id)?.percentage ?? 0) > 0
  )
  const autoShare = autoActive.length > 0 ? Math.max(0, remaining) / autoActive.length : 0
  return people.map(p => {
    if (manuallySet.has(p.id))
      return { personId: p.id, percentage: shares.find(s => s.personId === p.id)?.percentage ?? 0 }
    const isActive = (shares.find(s => s.personId === p.id)?.percentage ?? 0) > 0
    return { personId: p.id, percentage: isActive ? autoShare : 0 }
  })
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
            style: { textAlign: 'right', width: 40 },
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

export default function ShareTable({ people, shares, onChange, onEqualSplit, manualResetKey }: ShareTableProps) {
  const [manuallySet, setManuallySet] = useState<Set<string>>(new Set())

  useEffect(() => {
    setManuallySet(new Set())
  }, [manualResetKey])

  function pct(personId: string): number {
    return shares.find(s => s.personId === personId)?.percentage ?? 0
  }

  function allShares(): ItemShare[] {
    return people.map(p => ({ personId: p.id, percentage: pct(p.id) }))
  }

  const total = people.reduce((sum, p) => sum + pct(p.id), 0)

  function updatePercentage(personId: string, value: number) {
    const newManuallySet = new Set([...manuallySet, personId])
    setManuallySet(newManuallySet)
    const updatedShares = allShares().map(s => s.personId === personId ? { ...s, percentage: value } : s)
    onChange(redistributeAuto(updatedShares, newManuallySet, people))
  }

  function setFull(personId: string) {
    const newManuallySet = new Set([...manuallySet, personId])
    setManuallySet(newManuallySet)
    const updatedShares = allShares().map(s => s.personId === personId ? { ...s, percentage: 100 } : s)
    onChange(redistributeAuto(updatedShares, newManuallySet, people))
  }

  function exclude(personId: string) {
    const newManuallySet = new Set(manuallySet)
    newManuallySet.delete(personId)
    setManuallySet(newManuallySet)
    const updatedShares = allShares().map(s => s.personId === personId ? { ...s, percentage: 0 } : s)
    onChange(redistributeAuto(updatedShares, newManuallySet, people))
  }

  function include(personId: string) {
    // Set placeholder pct > 0 to join the auto pool; person is NOT manually set
    const updatedShares = allShares().map(s => s.personId === personId ? { ...s, percentage: 1 } : s)
    onChange(redistributeAuto(updatedShares, manuallySet, people))
  }

  function toggle(personId: string) {
    const isIncluded = pct(personId) > 0
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
