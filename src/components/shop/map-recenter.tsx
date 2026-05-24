'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function MapRecenter({ pos, zoom = 16 }: { pos: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo(pos, zoom, { duration: 0.6 });
  }, [pos, zoom, map]);
  return null;
}
