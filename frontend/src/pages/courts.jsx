import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import { useMemo, useState, useEffect } from "react";
import { getCourts } from '../api/courts'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

function RequestCourtModal({ coords, onClose }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')
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
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        zIndex: 101,
        padding: '28px 20px 48px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: '#e0e0e0', margin: '0 auto 20px',
        }} />

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏀</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 6 }}>
              Request Submitted!
            </h2>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
              An admin will review your submission and approve it shortly.
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '14px',
                borderRadius: 16, border: 'none',
                background: '#134e4a', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4 }}>
              Request a Court
            </h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>

            {/* Court name */}
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
                  width: '100%', padding: '12px 14px',
                  borderRadius: 12, border: '1.5px solid #e5e7eb',
                  fontSize: 14, outline: 'none',
                  background: '#f9fafb', boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, padding: '14px',
                  borderRadius: 16,
                  border: '1.5px solid #e5e7eb',
                  background: '#fff', color: '#555',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 2, padding: '14px',
                  borderRadius: 16, border: 'none',
                  background: submitting ? '#5f9ea0' : '#134e4a',
                  color: '#fff',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default function CourtsMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courts, setCourts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newCourtCoords, setNewCourtCoords] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    getCourts()
      .then(data => { console.log('courts:', data); setCourts(data) })
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
          zoom: 12
        });
      },
      (err) => console.error("Location denied or error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  const initialViewState = useMemo(() => userLocation, [userLocation]);

  if (!userLocation) return <div>Loading your location...</div>;

  return (
    <>
      <Map
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={initialViewState}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/khalilshotss/cmkv0lhlk008k01s9crq80dug"
        onClick={() => setSelectedCourt(null)}
        onDblClick={(e) => {
          e.preventDefault()
          setNewCourtCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng })
          setShowRequestModal(true)
        }}
      >
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="courts" />

        {/* Hamburger button */}
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
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <rect width="16" height="2" rx="1" fill="white"/>
            <rect y="5" width="11" height="2" rx="1" fill="white"/>
            <rect y="10" width="16" height="2" rx="1" fill="white"/>
          </svg>
        </button>

        {/* Double-tap hint */}
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
          Double-tap to request a new court
        </div>

        {/* User location marker */}
        <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
          <div style={{ fontSize: 28 }}>📍</div>
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
              onClick={(e) => {
                setSelectedCourt(court)
                e.stopPropagation()
              }}
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
        {selectedCourt && (
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

      {/* Request modal — outside <Map> so it overlays correctly */}
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
