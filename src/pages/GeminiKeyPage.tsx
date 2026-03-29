import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import PageHeader from '../components/common/PageHeader'
import PageContent from '../components/common/PageContent'
import { getGeminiKey, setGeminiKey, clearGeminiKey } from '../services/geminiKey'
import { useToast } from '../hooks/useToast'
import './GeminiKeyPage.css'

export default function GeminiKeyPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [key, setKey] = useState(getGeminiKey() ?? '')
  const [showKey, setShowKey] = useState(false)

  function handleConfirm() {
    const trimmed = key.trim()
    if (!trimmed) return
    setGeminiKey(trimmed)
    showToast('API key saved')
    navigate(-1)
  }

  function handleClear() {
    clearGeminiKey()
    setKey('')
    showToast('API key cleared')
  }

  return (
    <div className="page gemini-key-page">
      <PageHeader
        left={
          <IconButton
            aria-label="Back"
            size="small"
            onClick={() => navigate(-1)}
            sx={{ color: 'var(--color-text-muted)', '&:hover': { background: 'var(--color-btn-hover)', color: 'var(--color-text)' } }}
          >
            <ArrowBackIcon />
          </IconButton>
        }
        title="Gemini API Key"
      />

      <PageContent scrollable>
        <div className="gemini-key-form">
          <p className="gemini-key-hint">
            Get your API key from{' '}
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="gemini-key-link"
            >
              Google AI Studio
            </a>
          </p>

          <OutlinedInput
            fullWidth
            type={showKey ? 'text' : 'password'}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Paste your API key here"
            inputProps={{ 'aria-label': 'Gemini API key input' }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  onClick={() => setShowKey(v => !v)}
                  edge="end"
                  size="small"
                >
                  {showKey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            }
            sx={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleConfirm}
            sx={{ textTransform: 'none', fontWeight: 'var(--font-weight-semibold)', fontFamily: 'inherit', fontSize: 'var(--font-size-base)' }}
          >
            Confirm
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={handleClear}
            sx={{ textTransform: 'none', fontWeight: 'var(--font-weight-semibold)', fontFamily: 'inherit', fontSize: 'var(--font-size-base)' }}
          >
            Clear API key
          </Button>
        </div>
      </PageContent>
    </div>
  )
}
