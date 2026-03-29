import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PageHeader from '../components/common/PageHeader'
import PageContent from '../components/common/PageContent'
import { savePeopleHistory, softDeleteAllReceipts } from '../services/storage'
import { useToast } from '../hooks/useToast'
import './SettingsPage.css'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false)

  async function handleClearParticipants() {
    await savePeopleHistory([])
    setConfirmingClear(false)
    showToast('Suggested participants cleared')
  }

  async function handleDeleteAllReceipts() {
    await softDeleteAllReceipts()
    setConfirmingDeleteAll(false)
    showToast('All receipts deleted')
  }

  return (
    <div className="page settings-page">
      <PageHeader
        left={
          <IconButton
            aria-label="Back"
            size="small"
            onClick={() => navigate('/')}
            sx={{ color: 'var(--color-text-muted)', '&:hover': { background: 'var(--color-btn-hover)', color: 'var(--color-text)' } }}
          >
            <ArrowBackIcon />
          </IconButton>
        }
        title="Settings"
      />

      <PageContent scrollable>
        <div className="settings-actions">
          <div className="settings-delete-box">
            <button className="settings-delete-btn" onClick={() => setConfirmingClear(v => !v)}>
              Delete suggested participants
            </button>
            {confirmingClear && (
              <div className="settings-confirm-row">
                <span className="settings-confirm-label">Confirm delete?</span>
                <IconButton size="small" aria-label="Confirm" onClick={handleClearParticipants} className="settings-icon-btn settings-icon-btn--danger">
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" aria-label="Cancel" onClick={() => setConfirmingClear(false)} className="settings-icon-btn">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            )}
          </div>

          <div className="settings-delete-box">
            <button className="settings-delete-btn" onClick={() => setConfirmingDeleteAll(v => !v)}>
              Delete all receipts
            </button>
            {confirmingDeleteAll && (
              <div className="settings-confirm-row">
                <span className="settings-confirm-label">Confirm delete?</span>
                <IconButton size="small" aria-label="Confirm" onClick={handleDeleteAllReceipts} className="settings-icon-btn settings-icon-btn--danger">
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" aria-label="Cancel" onClick={() => setConfirmingDeleteAll(false)} className="settings-icon-btn">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            )}
          </div>

          <div className="settings-action-row">
            <Button fullWidth variant="outlined" onClick={() => navigate('/deleted')} sx={{ textTransform: 'none', fontWeight: 'var(--font-weight-semibold)', fontFamily: 'inherit', fontSize: 'var(--font-size-base)' }}>
              See deleted receipts
            </Button>
          </div>

          <div className="settings-action-row">
            <Button fullWidth variant="outlined" onClick={() => navigate('/gemini-key')} sx={{ textTransform: 'none', fontWeight: 'var(--font-weight-semibold)', fontFamily: 'inherit', fontSize: 'var(--font-size-base)' }}>
              Gemini API key
            </Button>
          </div>
        </div>
      </PageContent>
    </div>
  )
}
