import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, Popup } from "react-map-gl";
import { useMemo, useState, useEffect } from "react";
import { courts } from "../data/courts";

export default function CourtsMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);

  useEffect(() => {
    // 1. Request location on mount
    const watchId = navigator.geolocation.getCurrentPosition(
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
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 2. Wrap the view state in useMemo to prevent unnecessary recalculations
  // if other parts of this component re-render.
  const initialViewState = useMemo(() => userLocation, [userLocation]);

  // 3. Only render the map once we have the location
  if (!userLocation) return <div>Loading your location...</div>;

  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      initialViewState={initialViewState}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="mapbox://styles/khalilshotss/cmkv0lhlk008k01s9crq80dug"
      onClick={() => setSelectedCourt(null)}
    >
        <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
        <div style={{ fontSize: 28 }}>📍</div>
        </Marker>
      
      {courts.map((court) => (
        <Marker
          key={court.id}
          latitude={court.lat}
          longitude={court.lng}
          anchor="bottom"
        >
          <button
            onClick={(e) => {
                setSelectedCourt(court)
                e.stopPropagation()
            }}
            style={{
              width: 32,
              height: 32,
              display: "grid",
              placeItems: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 24,
              lineHeight: "24px",
            }}
          >
            🏀
          </button>
        </Marker>
      ))}

      {selectedCourt && (
        <Popup
          latitude={selectedCourt.lat}
          longitude={selectedCourt.lng}
          anchor="top"
          onClose={() => setSelectedCourt(null)}
          closeOnClick={false}
        >
          <strong style={{ color: "#333", fontSize: "16px", padding: "5px" }}>
        {selectedCourt.name}
        </strong>
        </Popup>
      )}
    </Map>
  );
}
