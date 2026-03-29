import './LoadingModal.css'

interface LoadingModalProps {
  open: boolean
  message?: string
}

export default function LoadingModal({ open, message = 'Loading…' }: LoadingModalProps) {
  if (!open) return null
  return (
    <div className="loading-backdrop">
      <div className="loading-box">
        <div className="loading-spinner" />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}
