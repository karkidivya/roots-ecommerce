'use client';

import { useEffect } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: { track: (event: string, data?: any) => void };
  }
}

/**
 * Fires a purchase/conversion event to GA4, Meta Pixel and TikTok Pixel once
 * per order. De-duped via sessionStorage so a page refresh doesn't double-count.
 * Amounts are in rupees (not paisa).
 */
export function PurchaseTracker({
  orderNumber,
  value,
  currency = 'NPR',
}: {
  orderNumber: string;
  value: number;
  currency?: string;
}) {
  useEffect(() => {
    const key = `purchase-tracked:${orderNumber}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    window.gtag?.('event', 'purchase', {
      transaction_id: orderNumber,
      value,
      currency,
    });
    window.fbq?.('track', 'Purchase', { value, currency });
    window.ttq?.track('CompletePayment', { value, currency });
  }, [orderNumber, value, currency]);

  return null;
}
