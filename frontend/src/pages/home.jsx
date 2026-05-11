import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useState } from 'react'
import { MapPin, User, ChevronRight } from 'lucide-react'

export default function MenuPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="home" />

      {/* Header */}
      <div className="bg-teal-950 px-5 pt-14 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <svg width="14" height="11" viewBox="0 0 16 12" fill="none">
              <rect width="16" height="2" rx="1" fill="white"/>
              <rect y="5" width="11" height="2" rx="1" fill="white"/>
              <rect y="10" width="16" height="2" rx="1" fill="white"/>
            </svg>
          </button>
        </div>
        <p className="text-teal-400 text-sm font-semibold mb-1">Welcome back </p>
        <h1 className="text-white text-3xl font-extrabold tracking-tight">
          Next<span className="text-teal-400">Game</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Find your next run</p>
      </div>

      {/* Nav cards */}
      <div className="flex-1 px-4 py-6 flex flex-col gap-4">

        <button
          onClick={() => navigate('/courts')}
          className="w-full bg-white rounded-2xl shadow-sm px-5 py-5 flex items-center gap-4 hover:bg-gray-50 active:scale-95 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl flex-shrink-0">
              <MapPin size={24} className="text-teal-700" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">Courts</p>
            <p className="text-xs text-gray-400 mt-0.5">Find courts near you</p>
          </div>
          <span className="ml-auto text-gray-300 text-lg">
            <ChevronRight size={20} className="text-gray-300 ml-auto" />
          </span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="w-full bg-white rounded-2xl shadow-sm px-5 py-5 flex items-center gap-4 hover:bg-gray-50 active:scale-95 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl flex-shrink-0">
              <User size={24} className="text-teal-700" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">Profile</p>
            <p className="text-xs text-gray-400 mt-0.5">Your stats and bio</p>
          </div>
          <span className="ml-auto text-gray-300 text-lg">
            <ChevronRight size={20} className="text-gray-300 ml-auto" />
          </span>
        </button>

      </div>
    </div>
  )
}
