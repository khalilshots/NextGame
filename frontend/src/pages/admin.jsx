import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ChevronLeft, Check, X, Bug, Lightbulb, MessageCircle } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

// ─── API ─────────────────────────────────────────

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

const getFeedback = async () => {
  const res = await axios.get(`${BASE_URL}/admin/feedback`, authHeaders())
  return res.data
}

const updateFeedback = async (id, resolved) => {
  const res = await axios.patch(
    `${BASE_URL}/admin/feedback/${id}`,
    { resolved },
    authHeaders()
  )
  return res.data
}

// ─── Helpers ─────────────────────────────────────

const TYPE_META = {
  bug:        { Icon: Bug,           label: 'Bug',        chip: 'bg-red-50 text-red-700',     accent: 'bg-red-500' },
  suggestion: { Icon: Lightbulb,     label: 'Idea',       chip: 'bg-amber-50 text-amber-700', accent: 'bg-amber-500' },
  other:      { Icon: MessageCircle, label: 'Other',      chip: 'bg-gray-100 text-gray-700',  accent: 'bg-gray-400' },
}

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Component ───────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate()

  const [me, setMe] = useState(null)
  const [courts, setCourts] = useState([])
  const [feedback, setFeedback] = useState([])
  const [tab, setTab] = useState('courts')
  const [feedbackFilter, setFeedbackFilter] = useState('open') // 'open' | 'all'

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
        const meData = await getMe()
        setMe(meData)

        if (!meData.is_admin) {
          setError('Access denied. Admins only.')
          setLoading(false)
          return
        }

        const [pending, fb] = await Promise.all([
          getPendingCourts().catch(() => []),
          getFeedback().catch(() => []),
        ])
        setCourts(pending)
        setFeedback(fb)
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

  // ─── Court actions ─────────────────────────────

  const handleApprove = async (courtId) => {
    try {
      setActionLoading(`court-${courtId}`)
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
      setActionLoading(`court-${courtId}`)
      await deleteCourt(courtId)
      setCourts(prev => prev.filter(c => c.id !== courtId))
      showToast('🗑 Court rejected and removed.')
    } catch {
      showToast('❌ Failed to reject.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Feedback actions ──────────────────────────

  const handleToggleResolved = async (id, current) => {
    try {
      setActionLoading(`fb-${id}`)
      await updateFeedback(id, !current)
      setFeedback(prev =>
        prev.map(f => (f.id === id ? { ...f, resolved: !current } : f))
      )
      showToast(current ? 'Reopened.' : '✔︎ Marked resolved.')
    } catch {
      showToast('❌ Failed to update.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Derived ──────────────────────────────────

  const openFeedback = feedback.filter(f => !f.resolved)
  const visibleFeedback = feedbackFilter === 'open' ? openFeedback : feedback

  // ─── Render ────────────────────────────────────

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
    <div className="min-h-screen bg-gray-100 pb-10">

      {/* Header */}
      <div className="bg-teal-950 px-5 pt-14 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate('/home')}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <h1 className="text-white text-xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-white/50 text-xs ml-11">
          Logged in as <span className="text-white/70 font-medium">{me?.username}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-3 flex gap-1 sticky top-0 z-10">
        <TabButton
          active={tab === 'courts'}
          onClick={() => setTab('courts')}
          label="Pending Courts"
          count={courts.length}
          countTone="amber"
        />
        <TabButton
          active={tab === 'feedback'}
          onClick={() => setTab('feedback')}
          label="Feedback"
          count={openFeedback.length}
          countTone="indigo"
        />
      </div>

      {/* ───── Courts tab ───── */}
      {tab === 'courts' && (
        <>
          <div className="bg-white border-b border-gray-200 px-5 py-2.5">
            <p className="text-xs text-gray-400">
              Approve to show on map · Reject to remove
            </p>
          </div>

          <div className="px-4 py-4 flex flex-col gap-3">
            {courts.length === 0 ? (
              <EmptyState
                emoji="🎉"
                title="All caught up!"
                subtitle="No pending court submissions."
              />
            ) : (
              courts.map((court) => (
                <div key={court.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
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
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="text-base font-bold text-gray-900 leading-tight">
                        {court.name || 'Unnamed Court'}
                      </h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
                        Pending
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-1">
                      📍 {court.latitude?.toFixed(5)}, {court.longitude?.toFixed(5)}
                    </p>

                    {court.submitted_by && (
                      <p className="text-xs text-gray-400 mb-3">
                        Submitted by{' '}
                        <span className="font-medium text-gray-600">{court.submitted_by}</span>
                      </p>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleApprove(court.id)}
                        disabled={actionLoading === `court-${court.id}`}
                        className="flex-1 py-2.5 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(court.id)}
                        disabled={actionLoading === `court-${court.id}`}
                        className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ───── Feedback tab ───── */}
      {tab === 'feedback' && (
        <>
          {/* Filter row */}
          <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2">
            <button
              onClick={() => setFeedbackFilter('open')}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                feedbackFilter === 'open'
                  ? 'bg-teal-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Open · {openFeedback.length}
            </button>
            <button
              onClick={() => setFeedbackFilter('all')}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                feedbackFilter === 'all'
                  ? 'bg-teal-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              All · {feedback.length}
            </button>
          </div>

          <div className="px-4 py-4 flex flex-col gap-3">
            {visibleFeedback.length === 0 ? (
              <EmptyState
                emoji={feedbackFilter === 'open' ? '🎉' : '📭'}
                title={feedbackFilter === 'open' ? 'Inbox zero!' : 'No feedback yet.'}
                subtitle={
                  feedbackFilter === 'open'
                    ? 'No open feedback to review.'
                    : 'User submissions will appear here.'
                }
              />
            ) : (
              visibleFeedback.map((fb) => {
                const meta = TYPE_META[fb.type] || TYPE_META.other
                const { Icon } = meta
                return (
                  <div
                    key={fb.id}
                    className={`bg-white rounded-2xl shadow-sm overflow-hidden flex ${
                      fb.resolved ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Left accent bar */}
                    <div className={`w-1 flex-shrink-0 ${meta.accent}`} />

                    <div className="flex-1 px-4 py-3 min-w-0">
                      {/* Top row: type + date */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${meta.chip}`}
                        >
                          <Icon size={11} strokeWidth={2.5} />
                          {meta.label}
                        </span>
                        {fb.resolved && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            Resolved
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400 ml-auto">
                          {formatDate(fb.created_at)}
                        </span>
                      </div>

                      {/* Message */}
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words mb-3">
                        {fb.message}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
                        <p className="text-xs text-gray-400 truncate">
                          from{' '}
                          <span className="font-medium text-gray-600">
                            {fb.username || `user #${fb.user_id}`}
                          </span>
                        </p>
                        <button
                          onClick={() => handleToggleResolved(fb.id, fb.resolved)}
                          disabled={actionLoading === `fb-${fb.id}`}
                          className={`text-xs font-semibold transition-colors disabled:opacity-40 flex-shrink-0 ${
                            fb.resolved
                              ? 'text-gray-500 hover:text-gray-700'
                              : 'text-teal-700 hover:text-teal-900'
                          }`}
                        >
                          {actionLoading === `fb-${fb.id}`
                            ? '...'
                            : fb.resolved
                            ? 'Reopen'
                            : 'Mark resolved ✔︎'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-8 left-4 right-4 text-white text-sm text-center px-4 py-3 rounded-2xl shadow-lg z-50 ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ─── Subcomponents ───────────────────────────────

function TabButton({ active, onClick, label, count, countTone }) {
  const toneClass =
    countTone === 'amber'
      ? 'bg-amber-100 text-amber-700'
      : countTone === 'indigo'
      ? 'bg-indigo-100 text-indigo-700'
      : 'bg-gray-100 text-gray-600'
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-3 text-sm font-semibold border-b-2 transition-colors ${
        active
          ? 'border-teal-900 text-teal-900'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${toneClass}`}>
          {count}
        </span>
      )}
    </button>
  )
}

function EmptyState({ emoji, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
      <span className="text-5xl">{emoji}</span>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  )
}
