import type { Coupon } from '@/lib/db/schema';

export interface CouponCheck {
  ok: boolean;
  discount: number; // paisa
  error?: string;
}

/**
 * Validate everything about a coupon that does NOT require a DB lookup, and
 * compute the discount for a given subtotal. The caller is still responsible
 * for the first-order-only check (needs the customer's order history).
 */
export function evaluateCoupon(coupon: Coupon, subtotal: number): CouponCheck {
  if (!coupon.isActive) {
    return { ok: false, discount: 0, error: 'This code is no longer active.' };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { ok: false, discount: 0, error: 'This code has expired.' };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, discount: 0, error: 'This code has reached its usage limit.' };
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      discount: 0,
      error: `Add more to your cart to use this code (minimum Rs ${Math.ceil(
        coupon.minSubtotal / 100
      )}).`,
    };
  }

  let discount =
    coupon.discountType === 'percent'
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue;

  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  // Never discount more than the subtotal.
  discount = Math.min(discount, subtotal);

  return { ok: true, discount };
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}
