import './PageHeader.css'

interface PageHeaderProps {
  left?: React.ReactNode   // back button or null for spacer
  title: React.ReactNode   // plain text or interactive element
  right?: React.ReactNode  // action button(s) or null
}

export default function PageHeader({ left, title, right }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        {left ?? <div className="page-header-spacer" />}
      </div>
      <div className="page-header-title">
        {typeof title === 'string'
          ? <span className="page-header-title-text">{title}</span>
          : title}
      </div>
      <div className="page-header-right">
        {right ?? null}
      </div>
    </div>
  )
}
