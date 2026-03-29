import './PageContent.css'

interface PageContentProps {
  children: React.ReactNode
  className?: string
  scrollable?: boolean
}

export default function PageContent({ children, className, scrollable }: PageContentProps) {
  const cls = ['page-content', scrollable && 'page-content--scrollable', className].filter(Boolean).join(' ')
  return <div className={cls}>{children}</div>
}
