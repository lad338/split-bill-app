import CameraAltIcon from '@mui/icons-material/CameraAlt'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import './FileImport.css'

interface FileImportProps {
  onFile: (dataUrl: string) => void
  onBeforeOpen?: () => boolean  // return false to cancel opening the file picker
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function FileImport({ onFile, onBeforeOpen }: FileImportProps) {
  function handleLabelClick(e: React.MouseEvent<HTMLLabelElement>) {
    if (onBeforeOpen && !onBeforeOpen()) {
      e.preventDefault()
    }
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onFile(await readAsDataUrl(file))
  }

  return (
    <div className="file-import">
      <label className="file-import-label file-import-camera" onClick={handleLabelClick}>
        <span className="file-import-icon">
          <CameraAltIcon sx={{ fontSize: 40, color: 'var(--color-text-muted)' }} />
        </span>
        <span className="file-import-text">Take a Photo</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </label>
      <label className="file-import-label" onClick={handleLabelClick}>
        <span className="file-import-icon">
          <PhotoLibraryIcon sx={{ fontSize: 40, color: 'var(--color-text-muted)' }} />
        </span>
        <span className="file-import-text">Choose Photo or File</span>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </label>
    </div>
  )
}
