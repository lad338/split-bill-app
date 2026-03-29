import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import SettingsIcon from '@mui/icons-material/Settings'
import { useReceipts } from '../hooks/useReceipts'
import PageHeader from '../components/common/PageHeader'
import PageContent from '../components/common/PageContent'
import SearchBar from '../components/list/SearchBar'
import ReceiptCard from '../components/list/ReceiptCard'
import AddReceiptCard from '../components/list/AddReceiptCard'
import { parseDateSearch, matchesDateSearch } from '../utils/dateSearch'
import './ListPage.css'

export default function ListPage() {
  const { receipts, loading } = useReceipts()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const parsed = parseDateSearch(search)

  const filtered = receipts.filter(r => {
    const titleMatch = (r.title ?? '').toLowerCase().includes(search.toLowerCase())
    if (!parsed) return titleMatch
    const dateTs = r.date ?? r.createdAt
    return titleMatch || matchesDateSearch(dateTs, parsed)
  })

  return (
    <div className="page">
      <PageHeader
        title="Split Bill"
        right={
          <IconButton
            aria-label="Settings"
            size="small"
            onClick={() => navigate('/settings')}
            sx={{ color: 'var(--color-text)', '&:hover': { background: 'var(--color-btn-hover)' } }}
          >
            <SettingsIcon />
          </IconButton>
        }
      />
      <PageContent scrollable>
        <SearchBar value={search} onChange={setSearch} />
        <div className="list-receipts">
        <AddReceiptCard onClick={() => navigate('/add')} />
        {loading && <p className="list-empty">Loading…</p>}
        {!loading && receipts.length === 0 && (
          <p className="list-empty">No receipts</p>
        )}
        {!loading && receipts.length > 0 && filtered.length === 0 && (
          <p className="list-empty">No search results</p>
        )}
        {filtered.map(r => (
          <ReceiptCard key={r.id} receipt={r} onClick={() => navigate(`/receipt/${r.id}`)} />
        ))}
      </div>
      </PageContent>
    </div>
  )
}
