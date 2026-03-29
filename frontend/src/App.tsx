import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import EditorPage from '@/pages/EditorPage'
import MyCharts from '@/pages/MyCharts'
import HomePage from '@/pages/HomePage'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="chartgen-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<EditorPage />} />
            <Route path="/edit/:id" element={<EditorPage />} />
            <Route path="/my-charts" element={<MyCharts />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App