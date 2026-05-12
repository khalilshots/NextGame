import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { ChevronLeft, LogOut, Settings, KeyRound, Trash2, X, Menu, MessageSquare } from 'lucide-react'

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
  const res = await axios.patch(
    `${BASE_URL}/users/me`,
    { bio, profile_picture },
    authHeaders()
  )
  return res.data
}

// TODO: move these to auth.js for modularity
const changePassword = async (current_password, new_password) => {
  const params = new URLSearchParams({ current_password, new_password })
  const res = await axios.patch(
    `${BASE_URL}/users/me/password?${params.toString()}`,
    {},
    authHeaders()
  )
  return res.data
}

const deleteAccount = async () => {
  await axios.delete(`${BASE_URL}/users/me`, authHeaders())
}

const sendFeedback = async (type, message) => {
  const res = await axios.post(
    `${BASE_URL}/me/feedback`,
    { type, message },
    authHeaders()
  )
  return res.data
}

// ───────────────────────────────────────────────
// Modals
// ───────────────────────────────────────────────

function SheetBackdrop({ onClose }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-[100]"
    />
  )
}

function SettingsModal({ onClose, onChangePassword, onSendFeedback, onDeleteAccount }) {
  return (
    <>
      <SheetBackdrop onClose={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[101] px-5 pt-3 pb-10 shadow-2xl">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={onChangePassword}
            className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
              <KeyRound size={18} className="text-teal-700" />
            </div>
            <span className="text-sm font-semibold text-gray-900 flex-1">Change password</span>
            <span className="text-gray-300 text-lg">›</span>
          </button>
          <button
            onClick={onSendFeedback}
            className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <MessageSquare size={18} className="text-indigo-700" />
            </div>
            <span className="text-sm font-semibold text-gray-900 flex-1">Send feedback</span>
            <span className="text-gray-300 text-lg">›</span>
          </button>
          <button
            onClick={onDeleteAccount}
            className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-red-50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <span className="text-sm font-semibold text-red-600 flex-1">Delete account</span>
            <span className="text-gray-300 text-lg">›</span>
          </button>
        </div>
      </div>
    </>
  )
}

function ChangePasswordModal({ onClose, onSuccess }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (next !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (next.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    try {
      setSubmitting(true)
      await changePassword(current, next)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        onSuccess?.()
      }, 1500)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to change password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SheetBackdrop onClose={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[101] px-5 pt-3 pb-10 shadow-2xl">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-sm font-semibold text-gray-700">Password updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Current password</label>
              <input
                type="password"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                required
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">New password</label>
              <input
                type="password"
                value={next}
                onChange={e => setNext(e.target.value)}
                required
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Confirm new password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-400 transition-colors"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-sm font-bold transition-colors disabled:opacity-50 mt-2"
            >
              {submitting ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}

function FeedbackModal({ onClose }) {
  const [type, setType] = useState('bug')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const MAX_LEN = 500

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (message.trim().length < 5) {
      setError('Please write a bit more so we can understand the issue.')
      return
    }
    try {
      setSubmitting(true)
      await sendFeedback(type, message.trim())
      setSuccess(true)
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      console.error('Feedback submit failed:', err)
      setError(err?.response?.data?.detail || 'Failed to send feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const types = [
    { key: 'bug', label: 'Bug' },
    { key: 'suggestion', label: 'Idea' },
    { key: 'other', label: 'Other' },
  ]

  return (
    <>
      <SheetBackdrop onClose={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[101] px-5 pt-3 pb-10 shadow-2xl">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Send Feedback</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <p className="text-sm font-semibold text-gray-700">Thanks! we got it!</p>
            <p className="text-xs text-gray-400 mt-1">We'll take a look soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Type selector */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">What kind of feedback?</label>
              <div className="grid grid-cols-3 gap-2">
                {types.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      type === t.key
                        ? 'bg-teal-900 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">Tell us more</label>
                <span className={`text-[10px] ${message.length > MAX_LEN - 50 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {message.length}/{MAX_LEN}
                </span>
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, MAX_LEN))}
                placeholder={
                  type === 'bug'
                    ? "What broke? What were you doing when it happened?"
                    : type === 'suggestion'
                    ? "What would make this app better for you?"
                    : "What's on your mind?"
                }
                rows={4}
                required
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 resize-none outline-none focus:border-teal-400 transition-colors"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting || message.trim().length === 0}
              className="w-full py-3 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-sm font-bold transition-colors disabled:opacity-40"
            >
              {submitting ? 'Sending...' : 'Send feedback'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}

function DeleteAccountModal({ onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState('')
  const canDelete = confirmText.toLowerCase() === 'delete'

  return (
    <>
      <SheetBackdrop onClose={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[101] px-5 pt-3 pb-10 shadow-2xl">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-red-600">Delete Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          This will permanently delete your account, bio, and check-in history.
          This action cannot be undone. Type{' '}
          <span className="font-bold text-gray-900">delete</span> to confirm.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="Type 'delete' to confirm"
          className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-400 transition-colors mb-4"
        />
        <button
          onClick={onConfirm}
          disabled={!canDelete}
          className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Delete my account
        </button>
      </div>
    </>
  )
}

// ───────────────────────────────────────────────
// Profile Page
// ───────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate()

  const [me, setMe] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage="profile"
      />

      {/* Header */}
      <div className="bg-teal-950 px-5 pt-14 pb-10 relative">
        <div className="flex items-center justify-between mb-6">
          {/* Left: back button */}
          <button
            onClick={() => navigate('/home')}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} color="white" />
          </button>

          {/* Right: settings + hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Settings size={18} color="white" />
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Menu size={18} color="white" />
            </button>
          </div>
        </div>

        {/* Avatar + name */}
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
                placeholder="Tell people a little about yourself... (location, age, height, years playing, etc.)"
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
                  className="flex-1 py-2 rounded-xl bg-teal-900 text-white text-sm font-semibold hover:bg-teal-800 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className={`text-sm leading-relaxed ${bio ? 'text-gray-700' : 'text-gray-400 italic'}`}>
              {bio || 'Heart > Height'}
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
          className="w-full py-4 rounded-2xl border border-red-200 bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onChangePassword={() => { setShowSettings(false); setShowChangePassword(true) }}
          onSendFeedback={() => { setShowSettings(false); setShowFeedback(true) }}
          onDeleteAccount={() => { setShowSettings(false); setShowDeleteConfirm(true) }}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
        />
      )}

      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteAccountModal
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            try {
              await deleteAccount()
              localStorage.removeItem('token')
              navigate('/login')
            } catch (err) {
              alert(`Failed to delete account: ${err?.response?.data?.detail || 'Unknown error'}`)
            }
          }}
        />
      )}
    </div>
  )
}
