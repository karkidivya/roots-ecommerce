'use client';

import { useMapEvents } from 'react-leaflet';

interface Props {
  onPick: (pos: [number, number]) => void;
}

export function MapClickHandler({ onPick }: Props) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}
