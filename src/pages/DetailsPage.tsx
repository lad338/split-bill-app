import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { getReceipt, saveReceipt } from '../services/storage'
import { useToast } from '../hooks/useToast'
import PageHeader from '../components/common/PageHeader'
import PageContent from '../components/common/PageContent'
import CollapsibleSection from '../components/details/CollapsibleSection'
import ParticipantsSection from '../components/details/ParticipantsSection'
import ItemsSection from '../components/details/ItemsSection'
import BalanceSection from '../components/details/BalanceSection'
import type { Receipt } from '../types'
import './DetailsPage.css'
import { getFinalPrice, getFormattedPrice, getTotalItemPrice } from '../utils/price'

function isBalanceReady(receipt: Receipt): boolean {
  if (!receipt.paidBy) return false
  if (receipt.items.length === 0) return false
  return receipt.items.every(item => {
    const total = item.shares.reduce((sum, s) => sum + s.percentage, 0)
    return Math.abs(total - 100) < 0.01
  })
}

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [highlightErrors, setHighlightErrors] = useState(false)

  const [participantsExpanded, setParticipantsExpanded] = useState(true)
  const [itemsExpanded, setItemsExpanded] = useState(true)
  const [balanceExpanded, setBalanceExpanded] = useState(false)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [editingDate, setEditingDate] = useState(false)
  const [dateDraft, setDateDraft] = useState<Dayjs | null>(null)

  useEffect(() => {
    if (!id) return
    getReceipt(id).then(r => {
      if (!r) navigate('/')
      else {
        setReceipt(r)
        setTitleDraft(r.title)
        setDateDraft(dayjs(r.date ?? r.createdAt))
        if (isBalanceReady(r)) {
          setParticipantsExpanded(false)
          setItemsExpanded(false)
          setBalanceExpanded(true)
        }
      }
    })
  }, [id, navigate])

  useEffect(() => {
    if (!editingTitle && receipt) setTitleDraft(receipt.title)
  }, [receipt?.title, editingTitle])

  useEffect(() => {
    if (!editingDate && receipt) setDateDraft(dayjs(receipt.date ?? receipt.createdAt))
  }, [receipt?.date, receipt?.createdAt, editingDate])

  useEffect(() => {
    if (receipt && highlightErrors && isBalanceReady(receipt)) {
      setHighlightErrors(false)
    }
  }, [receipt, highlightErrors])

  async function handleChange(updated: Receipt) {
    setReceipt(updated)
    await saveReceipt(updated)
  }

  function confirmTitle() {
    if (!receipt) return
    handleChange({ ...receipt, title: titleDraft })
    setEditingTitle(false)
    showToast('Title saved')
  }

  function cancelTitle() {
    if (receipt) setTitleDraft(receipt.title)
    setEditingTitle(false)
  }

  function confirmDate() {
    if (!receipt || !dateDraft?.isValid()) return
    handleChange({ ...receipt, date: dateDraft.startOf('day').add(12, 'hour').valueOf() })
    setEditingDate(false)
    showToast('Date saved')
  }

  function cancelDate() {
    if (receipt) setDateDraft(dayjs(receipt.date ?? receipt.createdAt))
    setEditingDate(false)
  }

  function handleBalanceToggle() {
    if (!balanceExpanded && !isBalanceReady(receipt!)) {
      setHighlightErrors(true)
      if (!receipt!.paidBy) {
        showToast('Please set paid person', 'warning')
      } else if (receipt!.items.length > 0) {
        showToast("Please assign item's share", 'warning')
      }
      return
    }
    setBalanceExpanded(v => !v)
  }

  if (!receipt) return null

  const itemsTotal = getTotalItemPrice(receipt);

  const itemsSummary = getFormattedPrice(itemsTotal);

  const balanceTotal = getFinalPrice(receipt);

  const balanceSummary = getFormattedPrice(balanceTotal);

  const titleNode = editingTitle ? (
    <div className="details-title-edit">
      <TextField
        variant="standard"
        value={titleDraft}
        onChange={e => setTitleDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') confirmTitle(); if (e.key === 'Escape') cancelTitle() }}
        autoFocus
        inputProps={{ maxLength: 100 }}
        sx={{
          flex: 1,
          '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border)' },
          '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent)' },
          '& .MuiInputBase-input': {
            color: 'var(--color-text)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-bold)',
            fontFamily: 'inherit',
            padding: '2px 6px',
          },
        }}
      />
      <IconButton size="small" aria-label="Cancel title edit" onClick={cancelTitle}>
        <CloseIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" aria-label="Confirm title" onClick={confirmTitle} disabled={!titleDraft.trim()}>
        <CheckIcon fontSize="small" />
      </IconButton>
    </div>
  ) : (
    <span
      className="page-header-title-text details-title-btn"
      role="button"
      tabIndex={0}
      onClick={() => { setTitleDraft(receipt.title); setEditingTitle(true) }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setTitleDraft(receipt.title)
          setEditingTitle(true)
        }
      }}
      aria-label="Edit title"
    >
      {receipt.title || 'Untitled Receipt'}
    </span>
  )

  return (
    <div className="page details-page">
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
        title={titleNode}
        right={
          confirmingDelete ? (
            <div className="details-delete-confirm">
              <span className="details-delete-confirm-label">Delete?</span>
              <IconButton
                size="small"
                aria-label="Confirm delete"
                onClick={async () => {
                  await handleChange({ ...receipt, deletedAt: Date.now() })
                  showToast('Receipt deleted')
                  navigate('/')
                }}
                sx={{ color: 'var(--color-text-muted)', '&:hover': { background: 'var(--color-btn-hover)', color: 'var(--color-text-danger)' } }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Cancel delete"
                onClick={() => setConfirmingDelete(false)}
                sx={{ color: 'var(--color-text-muted)', '&:hover': { background: 'var(--color-btn-hover)', color: 'var(--color-text)' } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          ) : (
            <IconButton
              aria-label="Delete receipt"
              size="small"
              onClick={() => setConfirmingDelete(true)}
              sx={{ color: 'var(--color-text-danger)', '&:hover': { background: 'var(--color-btn-hover)' } }}
            >
              <DeleteIcon />
            </IconButton>
          )
        }
      />

      <PageContent className="details-page-content">
        <div className="details-date-row">
          {editingDate ? (
            <>
              <DatePicker
                value={dateDraft}
                onChange={setDateDraft}
                format="YYYY/MM/DD"
                slotProps={{
                  textField: {
                    variant: 'standard',
                    autoFocus: true,
                    size: 'small',
                    sx: {
                      width: 'auto',
                      '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border)' },
                      '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent)' },
                      '& .MuiInputBase-input': { color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontFamily: 'inherit', padding: '4px 0' },
                      '& .MuiIconButton-root': { color: 'var(--color-text-muted)' },
                    },
                  },
                }}
              />
              <IconButton size="small" aria-label="Cancel date edit" onClick={cancelDate}>
                <CloseIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="Confirm date" onClick={confirmDate}>
                <CheckIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <p
              role="button"
              tabIndex={0}
              onClick={() => setEditingDate(true)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditingDate(true) } }}
              aria-label="Edit date"
              style={{ cursor: 'pointer', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}
            >
              {dayjs(receipt.date ?? receipt.createdAt).format('YYYY/MM/DD')}
            </p>
          )}
        </div>

        <CollapsibleSection
          title="Participants"
          expanded={participantsExpanded}
          onToggle={() => setParticipantsExpanded(v => !v)}
        >
          <ParticipantsSection receipt={receipt} onChange={handleChange} highlightErrors={highlightErrors} />
        </CollapsibleSection>

        <CollapsibleSection
          title="Items"
          summary={itemsSummary}
          expanded={itemsExpanded}
          onToggle={() => setItemsExpanded(v => !v)}
        >
          <ItemsSection receipt={receipt} onChange={handleChange} highlightErrors={highlightErrors} />
        </CollapsibleSection>

        <CollapsibleSection
          title="Balance"
          summary={balanceSummary}
          expanded={balanceExpanded}
          onToggle={handleBalanceToggle}
        >
          <BalanceSection receipt={receipt} onChange={handleChange} />
        </CollapsibleSection>
      </PageContent>
    </div>
  )
}
