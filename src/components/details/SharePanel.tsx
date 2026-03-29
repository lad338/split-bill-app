import { useToast } from '../../hooks/useToast'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ShareIcon from '@mui/icons-material/Share'
import { generateMessage } from '../../utils/shareMessage'
import './SharePanel.css'
import type { Receipt } from '../../types'

export default function SharePanel({ receipt }: { receipt: Receipt }) {
  const { showToast } = useToast()

  async function handleCopy() {
    await navigator.clipboard.writeText(generateMessage(receipt))
    showToast('Copied to clipboard')
  }

  async function handleShare() {
    await navigator.share({ text: generateMessage(receipt) })
  }

  return (
    <div className="share-panel">
      <Tooltip title="Copy" disableInteractive>
        <IconButton aria-label="Copy" onClick={handleCopy}>
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
      {typeof navigator.share === 'function' && (
        <Tooltip title="Share" disableInteractive>
          <IconButton aria-label="Share" onClick={handleShare}>
            <ShareIcon />
          </IconButton>
        </Tooltip>
      )}
    </div>
  )
}
