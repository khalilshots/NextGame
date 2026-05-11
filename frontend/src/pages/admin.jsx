import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ChevronLeft } from 'lucide-react'


const BASE_URL = import.meta.env.VITE_API_URL

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const getMe = async () => {
  const res = await axios.get(`${BASE_URL}/users/me`, authHeaders())
  return res.data
}

const getPendingCourts = async () => {
  const res = await axios.get(`${BASE_URL}/courts/pending`, authHeaders())
  return res.data
}

const updateCourtStatus = async (courtId, newStatus) => {
  const res = await axios.patch(
    `${BASE_URL}/courts/${courtId}/status?status=${newStatus}`,
    {},
    authHeaders()
  )
  return res.data
}

const deleteCourt = async (courtId) => {
  await axios.delete(`${BASE_URL}/courts/${courtId}`, authHeaders())
}

export default function AdminPage() {
  const navigate = useNavigate()

  const [me, setMe] = useState(null)
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Get current user and verify they are admin
        const meData = await getMe()
        setMe(meData)

        if (!meData.is_admin) {
          setError('Access denied. Admins only.')
          setLoading(false)
          return
        }

        // 2. Load pending courts
        const pending = await getPendingCourts()
        setCourts(pending)
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate('/login')
        } else {
          setError('Failed to load admin panel.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  const handleApprove = async (courtId) => {
    try {
      setActionLoading(courtId)
      await updateCourtStatus(courtId, 'approved')
      setCourts(prev => prev.filter(c => c.id !== courtId))
      showToast("✅ Court approved — it's live on the map.")
    } catch {
      showToast('❌ Failed to approve.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (courtId) => {
    try {
      setActionLoading(courtId)
      await deleteCourt(courtId)
      setCourts(prev => prev.filter(c => c.id !== courtId))
      showToast('🗑 Court rejected and removed.')
    } catch {
      showToast('❌ Failed to reject.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-3">
        <span className="text-4xl">🔒</span>
        <p className="text-gray-700 font-semibold">{error}</p>
        <button
          onClick={() => navigate('/home')}
          className="text-sm text-teal-700 underline"
        >
          Go back home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-teal-950 px-5 pt-14 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate('/home')}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-lg hover:bg-white/20 transition-colors"
          >
              <ChevronLeft size={20} color="white" />
          </button>
          <h1 className="text-white text-xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-white/50 text-xs ml-11">
          Logged in as <span className="text-white/70 font-medium">{me?.username}</span>
        </p>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
          {courts.length} pending
        </span>
        <span className="text-xs text-gray-400">
          Approve to show on map · Reject to remove
        </span>
      </div>

      {/* Court list */}
      <div className="px-4 py-4 flex flex-col gap-3">
        {courts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <span className="text-5xl">🎉</span>
            <p className="text-sm font-medium text-gray-600">All caught up!</p>
            <p className="text-xs text-gray-400">No pending court submissions.</p>
          </div>
        ) : (
          courts.map((court) => (
            <div key={court.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">

              {/* Image or placeholder */}
              {court.image_url ? (
                <img
                  src={court.image_url}
                  alt={court.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-28 bg-gradient-to-br from-teal-950 to-teal-800 flex items-center justify-center">
                  <span className="text-4xl opacity-20">📍</span>
                </div>
              )}

              <div className="px-4 py-3">

                {/* Name + badge */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    {court.name || 'Unnamed Court'}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
                    Pending
                  </span>
                </div>

                {/* Coordinates */}
                <p className="text-xs text-gray-400 mb-1">
                  📍 {court.latitude?.toFixed(5)}, {court.longitude?.toFixed(5)}
                </p>

                {/* Submitted by */}
                {court.submitted_by && (
                  <p className="text-xs text-gray-400 mb-3">
                    Submitted by{' '}
                    <span className="font-medium text-gray-600">{court.submitted_by}</span>
                  </p>
                )}

                {/* Approve / Reject */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApprove(court.id)}
                    disabled={actionLoading === court.id}
                    className="flex-1 py-2.5 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-sm font-semibold transition-colors disabled:opacity-40"
                  >
                    {actionLoading === court.id ? '...' : '✓ Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(court.id)}
                    disabled={actionLoading === court.id}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-40"
                  >
                    {actionLoading === court.id ? '...' : '✕ Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 left-4 right-4 text-white text-sm text-center px-4 py-3 rounded-2xl shadow-lg z-50
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
