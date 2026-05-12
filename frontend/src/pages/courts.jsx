import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import { useMemo, useState, useEffect, useRef } from "react";
import { getCourts } from '../api/courts'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import axios from 'axios'
import { MapPin, Menu, Plus, Crosshair, X } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

// Fallback location (used if geolocation denied / times out)
const FALLBACK_LOCATION = { latitude: 33.96813, longitude: -6.88544, zoom: 12 }

// ─────────────────────────────────────────────────
// Request court modal (final step: name + submit)
// ─────────────────────────────────────────────────

function RequestCourtModal({ coords, onClose }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token || token === 'undefined') {
      localStorage.removeItem('token')
      navigate('/login')
      return
    }
    try {
      setSubmitting(true)
      await axios.post(
        `${BASE_URL}/courts/request`,
        {
          name: name || 'Unnamed Court',
          latitude: coords.lat,
          longitude: coords.lng,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSubmitted(true)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Submission failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderRadius: '24px 24px 0 0',
        zIndex: 101, padding: '28px 20px 48px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e0e0e0', margin: '0 auto 20px' }} />

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏀</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 6 }}>Request Submitted!</h2>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
              An admin will review your submission and approve it shortly.
            </p>
            <button onClick={onClose} style={{
              width: '100%', padding: '14px', borderRadius: 16, border: 'none',
              background: '#134e4a', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4 }}>Request a Court</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} /> {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                Court name <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rucker Park"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
                  background: '#f9fafb', boxSizing: 'border-box',
                }}
              />
            </div>

            {error && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, padding: '14px', borderRadius: 16,
                border: '1.5px solid #e5e7eb', background: '#fff', color: '#555',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{
                flex: 2, padding: '14px', borderRadius: 16, border: 'none',
                background: submitting ? '#5f9ea0' : '#134e4a', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1,
              }}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────
// Add court bottom sheet (two options)
// ─────────────────────────────────────────────────

function AddCourtSheet({ onClose, onUseLocation, onPickOnMap, locating }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderRadius: '24px 24px 0 0',
        zIndex: 101, padding: '20px 20px 40px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e0e0e0', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Add a court</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
          How do you want to set the location?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={onUseLocation}
            disabled={locating}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px', borderRadius: 16, border: 'none',
              background: '#f0fdfa', cursor: 'pointer', textAlign: 'left',
              opacity: locating ? 0.5 : 1,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#134e4a', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <MapPin size={18} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>
                {locating ? 'Getting your location…' : 'Use my current location'}
              </p>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2, margin: 0 }}>
                Best if you're standing at the court
              </p>
            </div>
          </button>

          <button
            onClick={onPickOnMap}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px', borderRadius: 16, border: 'none',
              background: '#f9fafb', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#374151', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Crosshair size={18} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>Pick on the map</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2, margin: 0 }}>
                Pan the map under the crosshair
              </p>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────
// Courts page
// ─────────────────────────────────────────────────

export default function CourtsMap() {
  const navigate = useNavigate()
  const mapRef = useRef(null)

  const [userLocation, setUserLocation] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courts, setCourts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [pickingOnMap, setPickingOnMap] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState(null)

  const [newCourtCoords, setNewCourtCoords] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)

  useEffect(() => {
    getCourts()
      .then(data => setCourts(data))
      .catch(err => console.error(err))
  }, [])

  // Initial load: try geolocation, fall back to default after 8s
  useEffect(() => {
    let locationFound = false

    const timer = setTimeout(() => {
      if (!locationFound) {
        console.log("Location timed out, using default.")
        setUserLocation(FALLBACK_LOCATION)
      }
    }, 8000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationFound = true
        clearTimeout(timer)
        setUserLocation({
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
          zoom: 12
        })
      },
      (err) => {
        console.error("Location error:", err)
        if (!locationFound) {
          clearTimeout(timer)
          setUserLocation(FALLBACK_LOCATION)
        }
      },
      { enableHighAccuracy: true }
    )

    return () => clearTimeout(timer)
  }, [])

  const initialViewState = useMemo(() => userLocation, [userLocation])

  // ─── Add-court handlers ────────────────────────

  const handleUseLocation = () => {
    setLocationError(null)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        setShowAddSheet(false)
        setNewCourtCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setShowRequestModal(true)
      },
      (err) => {
        setLocating(false)
        setLocationError(
          err.code === 1
            ? "Location access denied. Enable it in your browser or pick on the map instead."
            : "Couldn't get your location. Try picking on the map."
        )
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handlePickOnMap = () => {
    setShowAddSheet(false)
    setPickingOnMap(true)
  }

  const handleConfirmPick = () => {
    const map = mapRef.current?.getMap()
    if (!map) return
    const center = map.getCenter()
    setNewCourtCoords({ lat: center.lat, lng: center.lng })
    setPickingOnMap(false)
    setShowRequestModal(true)
  }

  if (!userLocation) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>Loading your location...</div>;

  return (
    <>
      <Map
        ref={mapRef}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={initialViewState}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/khalilshotss/cmkv0lhlk008k01s9crq80dug"
        onClick={() => setSelectedCourt(null)}
        /* NOTE: onDblClick removed — was conflicting with Android pinch/double-tap zoom */
      >
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="courts" />

        {/* Hamburger button — hidden in picking mode */}
        {!pickingOnMap && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: 'fixed', top: 16, left: 16,
              width: 40, height: 40,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(8px)',
              border: 'none', borderRadius: '50%',
              cursor: 'pointer', zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Menu size={18} color="white" />
          </button>
        )}
        <div style={{
          position: 'fixed', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.5)',
          color: '#fff', fontSize: 12, fontWeight: 500,
          padding: '6px 14px', borderRadius: 20,
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none', whiteSpace: 'nowrap',
          zIndex: 10,
        }}>
          click the plus on the bottom right to request a new court!
        </div>
        {/* User location marker */}
        <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
          <MapPin size={28} color="#000000" fill="#2dd4bf" strokeWidth={1.5} />
        </Marker>

        {/* Court markers */}
        {courts.map((court) => (
          <Marker
            key={court.id}
            latitude={court.latitude}
            longitude={court.longitude}
            anchor="bottom"
          >
            <button
              onClick={(e) => { setSelectedCourt(court); e.stopPropagation() }}
              style={{
                width: 32, height: 32,
                display: "grid", placeItems: "center",
                background: "transparent", border: "none",
                cursor: "pointer", fontSize: 24, lineHeight: "24px",
              }}
            >
              🏀
            </button>
          </Marker>
        ))}

        {/* Court popup */}
        {selectedCourt && !pickingOnMap && (
          <Popup
            latitude={selectedCourt.latitude}
            longitude={selectedCourt.longitude}
            anchor="top"
            onClose={() => setSelectedCourt(null)}
            closeOnClick={false}
          >
            <div style={{ padding: '4px 6px' }}>
              <strong style={{ color: '#333', fontSize: '15px' }}>{selectedCourt.name}</strong>
              <br />
              <button
                onClick={() => navigate(`/courts/${selectedCourt.id}`)}
                style={{
                  marginTop: 8, padding: '6px 14px',
                  background: '#134e4a', color: '#fff',
                  border: 'none', borderRadius: 8,
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}
              >
                View Court →
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* ───── Crosshair pick mode ───── */}
      {pickingOnMap && (
        <>
          {/* Centered crosshair pin (fixed in viewport) */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -100%)',
            zIndex: 20, pointerEvents: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{
              background: '#134e4a', color: '#fff',
              fontSize: 11, fontWeight: 600,
              padding: '4px 10px', borderRadius: 999,
              marginBottom: 4, whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            }}>
              Drop pin here
            </div>
            <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
              <path
                d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z"
                fill="#134e4a" stroke="white" strokeWidth="2"
              />
              <circle cx="18" cy="18" r="6" fill="white" />
            </svg>
          </div>

          {/* Top instruction banner */}
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 15,
            background: 'rgba(19,46,46,0.95)', backdropFilter: 'blur(8px)',
            padding: '48px 16px 12px',
          }}>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, textAlign: 'center', margin: 0 }}>
              Pan the map to position the pin
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center', marginTop: 2 }}>
              Pinch to zoom · drag to move
            </p>
          </div>

          {/* Bottom action bar */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 15,
            background: '#fff', padding: '16px 16px 32px',
            boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
            display: 'flex', gap: 8,
          }}>
            <button
              onClick={() => setPickingOnMap(false)}
              style={{
                flex: 1, padding: '14px', borderRadius: 16,
                border: '1.5px solid #e5e7eb', background: '#fff',
                color: '#555', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPick}
              style={{
                flex: 2, padding: '14px', borderRadius: 16, border: 'none',
                background: '#134e4a', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Confirm location
            </button>
          </div>
        </>
      )}

      {/* ───── Floating + button ───── */}
      {!pickingOnMap && !showRequestModal && !showAddSheet && (
        <button
          onClick={() => setShowAddSheet(true)}
          aria-label="Add a court"
          style={{
            position: 'fixed', bottom: 32, right: 20,
            width: 56, height: 56, borderRadius: '50%',
            background: '#134e4a', border: 'none', color: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10,
          }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}

      {/* ───── Add court sheet ───── */}
      {showAddSheet && (
        <AddCourtSheet
          onClose={() => { setShowAddSheet(false); setLocationError(null) }}
          onUseLocation={handleUseLocation}
          onPickOnMap={handlePickOnMap}
          locating={locating}
        />
      )}

      {/* Location error toast */}
      {locationError && (
        <div style={{
          position: 'fixed', bottom: 110, left: 16, right: 16, zIndex: 102,
          background: '#dc2626', color: '#fff', fontSize: 13,
          padding: '12px 16px', borderRadius: 16, textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          {locationError}
          <button
            onClick={() => setLocationError(null)}
            style={{
              marginLeft: 8, background: 'none', border: 'none',
              color: '#fff', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ───── Request modal (final step: name + submit) ───── */}
      {showRequestModal && newCourtCoords && (
        <RequestCourtModal
          coords={newCourtCoords}
          onClose={() => {
            setShowRequestModal(false)
            setNewCourtCoords(null)
          }}
          
        />
      )}
    </>
  );
}
