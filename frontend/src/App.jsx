import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<RegisterPage/>} />
      <Route path="/home" element={<div>Home</div>} />
      <Route path="/courts" element={<div>Courts</div>} />
      <Route path="/courts/:id" element={<div>Court Detail</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
    </Routes>
  )
}

export default App


