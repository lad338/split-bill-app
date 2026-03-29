import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import RestoreIcon from '@mui/icons-material/Restore'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PageHeader from '../components/common/PageHeader'
import PageContent from '../components/common/PageContent'
import ReceiptCard from '../components/list/ReceiptCard'
import {
  getSoftDeletedReceipts,
  hardDeleteReceipt,
  hardDeleteAllSoftDeleted,
  saveReceipt,
} from '../services/storage'
import { useToast } from '../hooks/useToast'
import type { Receipt } from '../types'
import './DeletedReceiptsPage.css'

export default function DeletedReceiptsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [emptyConfirming, setEmptyConfirming] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    getSoftDeletedReceipts().then(r => {
      r.sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0))
      setReceipts(r)
      setLoading(false)
    })
  }, [])

  async function handleHardDelete(id: string) {
    await hardDeleteReceipt(id)
    setReceipts(prev => prev.filter(r => r.id !== id))
    setConfirmDeleteId(null)
    showToast('Receipt permanently deleted')
  }

  async function handleEmptyTrash() {
    await hardDeleteAllSoftDeleted()
    setReceipts([])
    setEmptyConfirming(false)
    showToast('Deleted receipts cleared')
  }

  async function handleRestore(receipt: Receipt, andEdit = false) {
    const restored = { ...receipt, deletedAt: undefined, updatedAt: Date.now() }
    await saveReceipt(restored)
    setReceipts(prev => prev.filter(r => r.id !== receipt.id))
    showToast('Receipt restored')
    if (andEdit) navigate(`/receipt/${receipt.id}`)
  }

  if (loading) return null

  const headerRight = emptyConfirming ? (
    <div className="deleted-empty-confirm">
      <span className="deleted-confirm-label">Empty trash?</span>
      <IconButton
        size="small"
        aria-label="Confirm empty trash"
        onClick={handleEmptyTrash}
        className="deleted-icon-btn deleted-icon-btn--danger"
      >
        <CheckIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        aria-label="Cancel empty trash"
        onClick={() => setEmptyConfirming(false)}
        className="deleted-icon-btn"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </div>
  ) : (
    <IconButton
      aria-label="Empty deleted receipts"
      size="small"
      onClick={() => setEmptyConfirming(true)}
      disabled={receipts.length === 0}
      sx={{ color: 'var(--color-text-danger)', '&:hover': { background: 'var(--color-btn-hover)' }, '&.Mui-disabled': { opacity: 0.35 } }}
    >
      <DeleteSweepIcon />
    </IconButton>
  )

  return (
    <div className="page">
      <PageHeader
        left={
          <IconButton
            aria-label="Back"
            size="small"
            onClick={() => navigate('/settings')}
            sx={{ color: 'var(--color-text-muted)', '&:hover': { background: 'var(--color-btn-hover)', color: 'var(--color-text)' } }}
          >
            <ArrowBackIcon />
          </IconButton>
        }
        title="Deleted Receipts"
        right={headerRight}
      />

      <PageContent scrollable>
        {receipts.length === 0 ? (
          <p className="deleted-empty">No deleted receipts</p>
        ) : (
          <div className="deleted-list">
            {receipts.map(receipt => (
              <div key={receipt.id} className="deleted-card-wrapper">
                <ReceiptCard receipt={receipt} onClick={() => {}} />
                <div className="deleted-card-actions">
                  {confirmDeleteId === receipt.id ? (
                    <div className="deleted-card-confirm">
                      <span className="deleted-confirm-label">Delete forever?</span>
                      <IconButton
                        size="small"
                        aria-label="Confirm delete"
                        onClick={() => handleHardDelete(receipt.id)}
                        className="deleted-icon-btn deleted-icon-btn--danger"
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Cancel delete"
                        onClick={() => setConfirmDeleteId(null)}
                        className="deleted-icon-btn"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </div>
                  ) : (
                    <IconButton
                      size="small"
                      aria-label="Delete forever"
                      onClick={() => setConfirmDeleteId(receipt.id)}
                      className="deleted-icon-btn deleted-icon-btn--danger"
                    >
                      <DeleteForeverIcon fontSize="small" />
                    </IconButton>
                  )}
                  <div className="deleted-card-actions-right">
                    <IconButton
                      size="small"
                      aria-label="Restore"
                      onClick={() => handleRestore(receipt)}
                      className="deleted-icon-btn"
                    >
                      <RestoreIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Restore and edit"
                      onClick={() => handleRestore(receipt, true)}
                      className="deleted-icon-btn"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  )
}
