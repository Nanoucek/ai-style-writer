import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import UploadPage from './pages/UploadPage'
import ProfilesPage from './pages/ProfilesPage'
import GeneratePage from './pages/GeneratePage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<UploadPage />} />
            <Route path="profily" element={<ProfilesPage />} />
            <Route path="generovat" element={<GeneratePage />} />
            <Route path="historie" element={<HistoryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
