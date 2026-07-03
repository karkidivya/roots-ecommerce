'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair, Search } from 'lucide-react';

// Leaflet must be loaded client-side only (uses window)
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), {
  ssr: false,
});
const ClickHandler = dynamic(
  () => import('./map-click-handler').then((m) => m.MapClickHandler),
  { ssr: false }
);
const MapRecenter = dynamic(
  () => import('./map-recenter').then((m) => m.MapRecenter),
  { ssr: false }
);

const DEFAULT_CENTER: [number, number] = [27.7041, 85.3076];

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export interface LocationPickerProps {
  initialLat?: string | null;
  initialLng?: string | null;
  /** Form-field names for the hidden inputs. Defaults to shippingLat / shippingLng. */
  latName?: string;
  lngName?: string;
}

export function LocationPicker({
  initialLat,
  initialLng,
  latName = 'shippingLat',
  lngName = 'shippingLng',
}: LocationPickerProps = {}) {
  const initialPos: [number, number] | null =
    initialLat && initialLng && !Number.isNaN(Number(initialLat)) && !Number.isNaN(Number(initialLng))
      ? [Number(initialLat), Number(initialLng)]
      : null;

  const [pos, setPos] = useState<[number, number] | null>(initialPos);
  const [locating, setLocating] = useState(false);
  const [icon, setIcon] = useState<unknown>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Fix default marker icon (paths break in webpack bundles)
  useEffect(() => {
    import('leaflet').then((L) => {
      const customIcon = L.icon({
        iconUrl:
          'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl:
          'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:
          'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      setIcon(customIcon);
    });
  }, []);

  // Close results dropdown when clicking outside
  useEffect(() => {
    if (!resultsOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [resultsOpen]);

  const useCurrentLocation = () => {
    if (!('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos([p.coords.latitude, p.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setResultsOpen(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&format=json&limit=6&countrycodes=np&addressdetails=0`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      });
      const json = (await res.json()) as SearchResult[];
      setResults(json);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const pickResult = (r: SearchResult) => {
    setPos([parseFloat(r.lat), parseFloat(r.lon)]);
    setQuery(r.display_name.split(',').slice(0, 2).join(','));
    setResultsOpen(false);
  };

  const center = useMemo(() => pos || DEFAULT_CENTER, [pos]);

  return (
    <div className="space-y-3">
      {/* Hidden inputs submitted with the parent form */}
      <input type="hidden" name={latName} value={pos ? pos[0] : ''} />
      <input type="hidden" name={lngName} value={pos ? pos[1] : ''} />

      {/* Search + locate row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div ref={searchBoxRef} className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runSearch();
                }
              }}
              placeholder="Search a place (e.g. Thamel, Pokhara, ward 5)…"
              className="h-10 w-full rounded-sm border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          {resultsOpen && (
            <div className="absolute z-[1000] mt-1 w-full rounded-sm border border-border bg-card shadow-soft overflow-hidden">
              {searching ? (
                <p className="p-3 text-xs text-muted-foreground">Searching…</p>
              ) : results.length === 0 ? (
                <p className="p-3 text-xs text-muted-foreground">
                  No matches in Nepal.
                </p>
              ) : (
                <ul className="max-h-64 overflow-y-auto">
                  {results.map((r) => (
                    <li key={r.place_id}>
                      <button
                        type="button"
                        onClick={() => pickResult(r)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      >
                        {r.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="inline-flex items-center justify-center gap-1.5 rounded-sm border bg-card px-3 h-10 text-xs hover:bg-muted disabled:opacity-50 whitespace-nowrap"
        >
          <Crosshair className="h-3.5 w-3.5" />
          {locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tap anywhere on the map to pin your exact spot, or drag the marker to fine-tune.
      </p>

      <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-sm border bg-muted">
        <MapContainer
          center={center}
          zoom={pos ? 16 : 12}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={setPos} />
          <MapRecenter pos={pos} />
          {pos && icon ? (
            <Marker
              position={pos}
              draggable
              /* @ts-expect-error icon type from dynamic import is unknown */
              icon={icon}
              eventHandlers={{
                dragend: (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
                  const ll = e.target.getLatLng();
                  setPos([ll.lat, ll.lng]);
                },
              }}
            />
          ) : null}
        </MapContainer>
      </div>

      {pos && (
        <div className="flex items-center justify-between text-xs">
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Pinned at{' '}
            <span className="font-mono">
              {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setPos(null)}
            className="text-destructive hover:underline"
          >
            Clear pin
          </button>
        </div>
      )}
    </div>
  );
}
