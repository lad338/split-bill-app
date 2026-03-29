import { ReactNode } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import './CollapsibleSection.css'

interface CollapsibleSectionProps {
  title: string
  summary?: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}

export default function CollapsibleSection({ title, summary, expanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="collapsible-section">
      <button
        className={`collapsible-section-header ${expanded ? 'collapsible-section-header--expanded' : ''}`}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="collapsible-section-title">{title}</span>
        {summary && <span className="collapsible-section-summary">{summary}</span>}
        <ExpandMoreIcon
          fontSize="small"
          className={`collapsible-section-chevron${expanded ? ' collapsible-section-chevron--expanded' : ''}`}
        />
      </button>
      {expanded && (
        <div className="collapsible-section-content">
          {children}
        </div>
      )}
    </div>
  )
}
