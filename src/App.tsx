import { createTheme, ThemeProvider } from '@mui/material/styles'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './hooks/useToast'
import ListPage from './pages/ListPage'
import AddPage from './pages/AddPage'
import DetailsPage from './pages/DetailsPage'
import SettingsPage from './pages/SettingsPage'
import DeletedReceiptsPage from './pages/DeletedReceiptsPage'
import GeminiKeyPage from './pages/GeminiKeyPage'
import './tokens.css'
import './App.css'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#58a6ff' },
    background: {
      paper: '#161b22',
      default: '#0d1117',
    },
    text: {
      primary: '#c9d1d9',
      secondary: '#8b949e',
    },
  },
})

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <ToastProvider>
      <BrowserRouter basename="/split-bill">
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/receipt/:id" element={<DetailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/deleted" element={<DeletedReceiptsPage />} />
          <Route path="/gemini-key" element={<GeminiKeyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
