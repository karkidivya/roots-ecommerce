// Shared, pure shipping-fee logic. Used on the client (checkout form preview)
// and re-run authoritatively on the server when the order is created.

export interface ShippingZoneLite {
  name: string;
  matchType: 'district' | 'province' | 'default';
  matchValue: string | null;
  fee: number; // paisa
  freeAbove: number | null; // paisa; null = never free
}

export interface ShippingResult {
  fee: number; // paisa
  zoneName: string | null;
  isFree: boolean;
}

const norm = (s: string | null | undefined) => (s || '').trim().toLowerCase();

/**
 * Pick the delivery fee for an address. Most specific match wins:
 * exact district → province → default fallback. Only active zones should be
 * passed in. Falls back to fee 0 with no zone when nothing matches.
 */
export function computeShipping(
  zones: ShippingZoneLite[],
  province: string,
  district: string,
  subtotal: number
): ShippingResult {
  const byDistrict = zones.find(
    (z) => z.matchType === 'district' && norm(z.matchValue) === norm(district) && district !== ''
  );
  const byProvince = zones.find(
    (z) => z.matchType === 'province' && norm(z.matchValue) === norm(province) && province !== ''
  );
  const fallback = zones.find((z) => z.matchType === 'default');

  const zone = byDistrict || byProvince || fallback;
  if (!zone) return { fee: 0, zoneName: null, isFree: false };

  const isFree = zone.freeAbove != null && subtotal >= zone.freeAbove;
  return {
    fee: isFree ? 0 : zone.fee,
    zoneName: zone.name,
    isFree,
  };
}
