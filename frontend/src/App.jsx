import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/register" element={<div>Register</div>} />
      <Route path="/home" element={<div>Home</div>} />
      <Route path="/courts" element={<div>Courts</div>} />
      <Route path="/courts/:id" element={<div>Court Detail</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
    </Routes>
  )
}

export default App
