import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import type { Person } from '../../types'

interface PeopleInputProps {
  people: Person[]
  suggestions: string[]
  onChange: (people: Person[]) => void
  onAddName: (name: string) => void
}

export default function PeopleInput({ people, suggestions, onChange, onAddName }: PeopleInputProps) {
  const availableSuggestions = suggestions.filter(s => !people.some(p => p.name === s))

  function handleChange(_: unknown, newValues: string[]) {
    const trimmed = newValues.map(n => n.trim()).filter(Boolean)
    const newPeople = trimmed.map(name => {
      const existing = people.find(p => p.name === name)
      return existing ?? { id: crypto.randomUUID(), name }
    })
    trimmed.forEach(name => {
      if (!people.some(p => p.name === name)) onAddName(name)
    })
    onChange(newPeople)
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      disableClearable
      options={availableSuggestions}
      value={people.map(p => p.name)}
      onChange={handleChange}
      renderTags={(value, getTagProps) =>
        value.map((name, index) => (
          <Chip
            label={name}
            {...getTagProps({ index })}
            key={name}
            variant="outlined"
            size="small"
            deleteIcon={<CloseIcon titleAccess={`Remove ${name}`} />}
            sx={{
              color: 'var(--color-accent)',
              borderColor: 'var(--color-accent)',
              '& .MuiChip-deleteIcon': {
                color: 'var(--color-accent)',
                '&:hover': { color: 'var(--color-text)' },
              },
            }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          placeholder={people.length === 0 ? 'Add person…' : ''}
          inputProps={{ ...params.inputProps, maxLength: 30 }}
          sx={{
            '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border)' },
            '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent)' },
            '& .MuiInputBase-input': {
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-base)',
            },
            '& .MuiInputBase-input::placeholder': { color: 'var(--color-text-muted)', opacity: 1 },
          }}
        />
      )}
    />
  )
}
