import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { nanoid } from 'nanoid'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import PageHeader from '../components/common/PageHeader'
import PageContent from '../components/common/PageContent'
import FileImport from '../components/add/FileImport'
import LoadingModal from '../components/common/LoadingModal'
import { analyzeReceiptImage } from '../services/analysis'
import { getGeminiKey } from '../services/geminiKey'
import { saveReceipt } from '../services/storage'
import { useToast } from '../hooks/useToast'
import type { Receipt } from '../types'
import './AddPage.css'

export default function AddPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [analyzing, setAnalyzing] = useState(false)

  function handleBeforeOpen(): boolean {
    if (!getGeminiKey()) {
      showToast('Please add your Gemini API key first', 'warning')
      navigate('/gemini-key')
      return false
    }
    return true
  }

  async function handleFile(dataUrl: string) {
    setAnalyzing(true)
    try {
      const result = await analyzeReceiptImage(dataUrl)
      const receipt: Receipt = {
        id: nanoid(),
        title: result.title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        date: result.date,
        imageData: dataUrl,
        paidBy: undefined,
        people: [],
        items: result.items,
        settlements: [],
      }
      await saveReceipt(receipt)
      showToast('Receipt added')
      navigate(`/receipt/${receipt.id}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to analyse receipt', 'warning')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleAddBlank() {
    const receipt: Receipt = {
      id: nanoid(),
      title: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      date: undefined,
      paidBy: undefined,
      people: [],
      items: [],
      settlements: [],
    }
    await saveReceipt(receipt)
    navigate(`/receipt/${receipt.id}`)
  }

  return (
    <div className="page">
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
        title="Add Receipt"
      />
      <PageContent scrollable>
        <FileImport onFile={handleFile} onBeforeOpen={handleBeforeOpen} />
        <Button
          fullWidth
          onClick={handleAddBlank}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '32px',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-medium)',
            background: 'var(--color-bg-container)',
            textTransform: 'none',
            color: 'var(--color-text)',
            fontFamily: 'inherit',
            fontWeight: 500,
            fontSize: 'var(--font-size-base)',
            marginTop: '0',
            '&:hover': { borderColor: 'var(--color-border-focus)', background: 'var(--color-bg-container)' },
          }}
        >
          <NoteAddIcon sx={{ fontSize: 40, color: 'var(--color-text-muted)' }} />
          Add Blank Receipt
        </Button>
      </PageContent>
      <LoadingModal open={analyzing} message="Analyzing receipt…" />
    </div>
  )
}
