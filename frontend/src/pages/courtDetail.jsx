import { useParams, useNavigate } from 'react-router-dom'
import { getCourtsById } from '../api/courts'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'

const BASE_URL = import.meta.env.VITE_API_URL

const checkIn = async (courtId) => {
  const token = localStorage.getItem('token')
  const response = await axios.post(
    `${BASE_URL}/courts/${courtId}/checkin`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data
}

const checkOut = async (courtId) => {
  const token = localStorage.getItem('token')
  const response = await axios.post(
    `${BASE_URL}/courts/${courtId}/checkout`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data
}

const getMe = async () => {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

const AVATAR_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#d97706',
  '#059669', '#dc2626', '#0891b2', '#65a30d'
]

// Deterministic color from username string
function getAvatarColor(username = '') {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(username = '') {
  return username.slice(0, 2).toUpperCase()
}

export default function CourtDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [court, setCourt] = useState(null)
  const [players, setPlayers] = useState([])   // string[] of usernames
  const [me, setMe] = useState(null)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [courtData, meData] = await Promise.all([
          getCourtsById(id),
          getMe()
        ])
        setCourt(courtData)
        setMe(meData)
        setPlayers(courtData.players ?? [])
        setIsCheckedIn((courtData.players ?? []).includes(meData.username))
      } catch (err) {
        setError('Failed to load court details.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleCheckIn = async () => {
    try {
      setActionLoading(true)
      await checkIn(id)
      setIsCheckedIn(true)
      setPlayers(prev => [me.username, ...prev])
      showToast('✅ Checked in — enjoy the run!')
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Check-in failed.'
      showToast(`❌ ${msg}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setActionLoading(true)
      await checkOut(id)
      setIsCheckedIn(false)
      setPlayers(prev => prev.filter(u => u !== me?.username))
      showToast('👋 Checked out. See you next time!')
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Check-out failed.'
      showToast(`❌ ${msg}`)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">Loading court...</p>
      </div>
    )
  }

  if (error || !court) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-sm">{error || 'Court not found.'}</p>
      </div>
    )
  }

  const hasImages = court.images?.length > 0

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 relative overflow-hidden">

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage="courts"
      />

      {/* ── TOP HALF: Court Image ── */}
      <div className="relative w-full bg-teal-950" style={{ height: '45vh' }}>

        {/* Top bar: back + menu */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/courts')}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white text-lg hover:bg-black/60 transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect width="16" height="2" rx="1" fill="white"/>
              <rect y="5" width="11" height="2" rx="1" fill="white"/>
              <rect y="10" width="16" height="2" rx="1" fill="white"/>
            </svg>
          </button>
        </div>

        {hasImages ? (
          <>
            <img
              src={court.images[0]}
              alt={court.name}
              className="w-full h-full object-cover"
            />
            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-10 bg-gradient-to-t from-black/70 to-transparent">
              <h1 className="text-white text-xl font-bold">{court.name}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 mt-1 inline-block">
                {court.status?.charAt(0).toUpperCase() + court.status?.slice(1)}
              </span>
            </div>
            {/* Add photo button */}
            <button className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-semibold backdrop-blur flex items-center gap-1 hover:bg-black/70 transition-colors">
              + Add photo
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-teal-950 to-teal-800">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
              📸
            </div>
            <p className="text-white/50 text-sm">No photos yet</p>
            <button className="px-5 py-2 rounded-full border border-white/30 bg-white/10 text-white text-sm font-semibold backdrop-blur hover:bg-white/20 transition-colors">
              + Add Images
            </button>
          </div>
        )}
      </div>

      {/* Court name + status (shown below image when no image, or always for status) */}
      {!hasImages && (
        <div className="px-4 pt-4 pb-2 bg-gray-100">
          <h1 className="text-gray-900 text-xl font-bold">{court.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {court.status?.charAt(0).toUpperCase() + court.status?.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* ── MIDDLE: Players ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">Currently Playing</h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
            {players.length} {players.length === 1 ? 'player' : 'players'}
          </span>
        </div>

        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
            <span className="text-4xl">🏀</span>
            <p className="text-sm">No one's here yet.</p>
            <p className="text-xs text-gray-300">Be the first to check in!</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm">
            {players.map((username) => {
              const isMe = username === me?.username
              return (
                <div key={username} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: getAvatarColor(username) }}
                  >
                    {getInitials(username)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {isMe ? 'You' : username}
                    </p>
                  </div>
                  {isMe && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300">
                      YOU
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── BOTTOM: Check In / Check Out ── */}
      <div className="px-4 pb-8 pt-3 bg-gray-100 border-t border-gray-200 flex flex-col gap-2.5">
        {!isCheckedIn ? (
          <button
            onClick={handleCheckIn}
            disabled={actionLoading}
            className="w-full py-4 rounded-2xl bg-teal-900 hover:bg-teal-800 text-white text-base font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            🏀 Check In
          </button>
        ) : (
          <>
            <div className="w-full py-4 rounded-2xl bg-teal-100 text-teal-800 text-base font-bold flex items-center justify-center gap-2">
              ✓ Checked In
            </div>
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="w-full py-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              🚪 Check Out
            </button>
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-32 left-4 right-4 bg-gray-900 text-white text-sm text-center px-4 py-3 rounded-2xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
