import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'

const BASE_URL = import.meta.env.VITE_API_URL

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const getMe = async () => {
  const res = await axios.get(`${BASE_URL}/users/me`, authHeaders())
  return res.data
}

const getMyCheckins = async () => {
  const res = await axios.get(`${BASE_URL}/users/me/checkins`, authHeaders())
  return res.data
}

const updateProfile = async ({ bio, profile_picture }) => {
  const res = await axios.patch(`${BASE_URL}/users/me`, { bio, profile_picture }, authHeaders())
  return res.data
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bio, setBio] = useState('')
  const [editingBio, setEditingBio] = useState(false)
  const [draftBio, setDraftBio] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const meData = await getMe()
        setMe(meData)
        setBio(meData.bio ?? '')
        try {
          const checkinData = await getMyCheckins()
          setCheckins(checkinData)
        } catch {
          setCheckins([])
        }
      } catch (err) {
        if (err?.response?.status === 401) navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  const handleSaveBio = async () => {
    try {
      const updated = await updateProfile({ bio: draftBio })
      setBio(updated.bio ?? '')
      setMe(prev => ({ ...prev, bio: updated.bio }))
    } catch {
      // silently fail — bio still updates locally
      setBio(draftBio)
    }
    setEditingBio(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const getInitials = (username = '') => username.slice(0, 2).toUpperCase()

  const totalCheckins = checkins.length
  const completedCheckins = checkins.filter(c => c.checkedout_time).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-400 text-sm">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="profile" />

      {/* Header */}
      <div className="bg-teal-950 px-5 pt-14 pb-10 relative">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/home')}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-lg hover:bg-white/20 transition-colors"
          >
            ‹
          </button>
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

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-teal-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-teal-800 shadow-lg">
            {getInitials(me?.username)}
          </div>
          <div className="text-center">
            <h1 className="text-white text-xl font-bold">{me?.username}</h1>
            {me?.is_admin && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 mt-1 inline-block">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-around">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalCheckins}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total runs</p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{completedCheckins}</p>
          <p className="text-xs text-gray-400 mt-0.5">Completed</p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {totalCheckins - completedCheckins}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Active</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-4">

        {/* Bio */}
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-900">Bio</h2>
            {!editingBio && (
              <button
                onClick={() => { setDraftBio(bio); setEditingBio(true) }}
                className="text-xs text-teal-700 font-semibold hover:text-teal-900 transition-colors"
              >
                {bio ? 'Edit' : '+ Add bio'}
              </button>
            )}
          </div>

          {editingBio ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={draftBio}
                onChange={e => setDraftBio(e.target.value)}
                placeholder="Tell people a little about yourself...(location, age, height, years of playing, etc.)"
                maxLength={160}
                rows={3}
                className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 resize-none outline-none focus:border-teal-400 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingBio(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBio}
                  className="flex-2 flex-1 py-2 rounded-xl bg-teal-900 text-white text-sm font-semibold hover:bg-teal-800 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 leading-relaxed">
              {bio || 'heart > height'}
            </p>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Recent Activity</h2>
          {checkins.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2 text-gray-400">
              <span className="text-3xl">🏀</span>
              <p className="text-sm">No check-ins yet.</p>
              <button
                onClick={() => navigate('/courts')}
                className="text-xs text-teal-700 font-semibold mt-1 hover:text-teal-900"
              >
                Find a court →
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-50">
              {checkins.slice(0, 5).map((checkin) => (
                <div key={checkin.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-base flex-shrink-0">
                    🏀
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      Court #{checkin.court_id}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(checkin.checkin_time).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    checkin.checkedout_time
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-teal-100 text-teal-700'
                  }`}>
                    {checkin.checkedout_time ? 'Done' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl border border-red-200 bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
        >
          🚪 Log out
        </button>

      </div>
    </div>
  )
}
