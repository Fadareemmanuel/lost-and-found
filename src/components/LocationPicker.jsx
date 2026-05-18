import { useState, useEffect, useRef } from "react";

export default function LocationPicker({ value, onChange }) {
  const [query, setQuery] = useState(value?.label || "");
  const [suggestions, setSuggestions] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletMap = useRef(null);

  // Load leaflet dynamically
  useEffect(() => {
    if (window.L) { setMapLoaded(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const center = value ? [value.lat, value.lng] : [6.5095, 3.3711]; // LASU coords
    const map = L.map(mapRef.current).setView(center, value ? 16 : 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    if (value) {
      markerRef.current = L.marker([value.lat, value.lng]).addTo(map);
    }

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
      onChange({ lat, lng, label });
      setQuery(label);
    });

    leafletMap.current = map;
  }, [mapLoaded]);

  // Search suggestions
  useEffect(() => {
    if (query.length < 3) { setSuggestions([]); return; }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=ng`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch { setSuggestions([]); }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  function pickSuggestion(s) {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    const label = s.display_name;
    onChange({ lat, lng, label });
    setQuery(label);
    setSuggestions([]);
    if (leafletMap.current) {
      leafletMap.current.setView([lat, lng], 16);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = window.L.marker([lat, lng]).addTo(leafletMap.current);
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          className="w-full rounded-xl border border-brand-gray-light bg-white px-4 py-3 text-dark shadow-sm outline-none transition placeholder:text-brand-gray focus:border-green focus:ring-2 focus:ring-green/25"
          placeholder="Type a location, e.g. LASU Library, Gate A..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); }}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-xl border border-brand-gray-light bg-white shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <li
                key={s.place_id}
                onClick={() => pickSuggestion(s)}
                className="cursor-pointer px-4 py-2 text-sm text-dark hover:bg-brand-gray-bg border-b border-brand-gray-light last:border-0"
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div ref={mapRef} style={{ height: "220px", borderRadius: "12px", zIndex: 0 }} />
      <p className="text-xs text-brand-gray">
        Search above or tap anywhere on the map to pin the exact location.
      </p>
      {value && (
        <p className="text-xs text-green font-medium">
          📍 {value.label}
        </p>
      )}
    </div>
  );
}
