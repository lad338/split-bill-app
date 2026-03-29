import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search receipts…' }: SearchBarProps) {
  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      inputProps={{ role: 'searchbox' }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'var(--color-text-muted)', fontSize: 18 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          background: 'var(--color-bg-recessed)',
          borderRadius: 'var(--radius-small)',
          '& fieldset': { borderColor: 'var(--color-border)' },
          '&:hover fieldset': { borderColor: 'var(--color-border)' },
          '&.Mui-focused fieldset': { borderColor: 'var(--color-border-focus)' },
        },
        '& .MuiInputBase-input': {
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-base)',
          fontFamily: 'var(--font-family-sans)',
        },
        '& .MuiInputBase-input::placeholder': {
          color: 'var(--color-text-subtle)',
          opacity: 1,
        },
      }}
    />
  )
}
