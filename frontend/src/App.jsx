import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import MenuPage from './pages/home'
import ProtectedRoute from './components/ProtectedRoute'
import CourtsMap from './pages/courts'  
import CourtDetail from './pages/courtDetail'
import AdminPage from './pages/admin'
import ProfilePage from './pages/profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<RegisterPage/>} />
      <Route path="/home" element={<ProtectedRoute><MenuPage/></ProtectedRoute>} />
      <Route path="/courts" element={<ProtectedRoute><CourtsMap/></ProtectedRoute>} />
      <Route path="/courts/:id" element={<ProtectedRoute><CourtDetail/></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

export default App


