import AddIcon from '@mui/icons-material/Add'
import './AddReceiptCard.css'

interface AddReceiptCardProps {
  onClick: () => void
}

export default function AddReceiptCard({ onClick }: AddReceiptCardProps) {
  return (
    <button className="add-receipt-card" onClick={onClick} aria-label="Add receipt">
      <AddIcon sx={{ color: 'var(--color-text-muted)', fontSize: 24 }} />
      <span className="add-receipt-label">Add receipt</span>
    </button>
  )
}
