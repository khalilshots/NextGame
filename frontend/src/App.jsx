import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import MenuPage from './pages/home'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<RegisterPage/>} />
      <Route path="/home" element={<ProtectedRoute><MenuPage/></ProtectedRoute>} />
      <Route path="/courts" element={<ProtectedRoute><div>Courts</div></ProtectedRoute>} />
      <Route path="/courts/:id" element={<ProtectedRoute><div>Court Detail</div></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><div>Profile</div></ProtectedRoute>} />
    </Routes>
  )
}

export default App


