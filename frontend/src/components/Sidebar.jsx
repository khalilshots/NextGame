import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Home, MapPin, User, Settings, LogOut } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL



const getMe = async () => {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    getMe()
      .then(user => {
        setIsLoggedIn(true)
        setIsAdmin(user.is_admin)
      })
      .catch(() => setIsLoggedIn(false))
  }, [])

const navItems = [
  { icon: <Home size={20} />, label: 'Home', path: '/home' },
  { icon: <MapPin size={20} />, label: 'Courts', path: '/courts' },
  { icon: <User size={20} />, label: 'Profile', path: '/profile' },
]

  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-teal-950 z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-6 pt-16 pb-6 border-b border-white/10">
          <p className="text-2xl font-extrabold text-white tracking-tight">
            Next<span className="text-teal-400">Game</span>
          </p>
          <p className="text-xs text-white/40 mt-1">Find your next run</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-5 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-left
                  transition-colors font-medium text-sm
                  ${isActive
                    ? 'bg-teal-400/15 text-teal-400'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0
                    ${isActive ? 'bg-teal-400/20' : 'bg-white/8'}`}
                  style={{ background: isActive ? 'rgba(45,212,191,0.18)' : 'rgba(255,255,255,0.07)' }}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Admin */}
        {isAdmin && (
          <button
            onClick={() => handleNavigate('/admin')}
            className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-left
              text-white/60 hover:bg-white/5 hover:text-white transition-colors font-medium text-sm"
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <Settings size={20} />
            </span>
            Admin
          </button>
        )}

        {/* Logout */}
        {isLoggedIn && (
          <div className="px-4 pb-12 border-t border-white/10 pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-left
                text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(255,80,80,0.1)' }}
              >
                <LogOut size={20} />
              </span>
              Log out
            </button>
          </div>
        )}
        
      </div>
    </>
  )
}
