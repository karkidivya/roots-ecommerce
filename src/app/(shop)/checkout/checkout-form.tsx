'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/cart/store';
import { formatPrice, NEPAL_PROVINCES } from '@/lib/utils';
import { computeShipping, type ShippingZoneLite } from '@/lib/shipping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { LocationPicker } from '@/components/shop/location-picker';
import { createOrder, validateCoupon } from './actions';

export type PaymentMethodKey = 'esewa' | 'khalti' | 'fonepay' | 'cod';

interface PaymentMethodOption {
  key: PaymentMethodKey;
  label: string;
  description: string;
}

interface AppliedCoupon {
  code: string;
  discount: number;
  label: string;
}

export function CheckoutForm({
  paymentMethods = [],
  shippingZones = [],
}: {
  paymentMethods?: PaymentMethodOption[];
  shippingZones?: ShippingZoneLite[];
}) {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>(
    (paymentMethods[0]?.key as PaymentMethodKey) || 'cod'
  );

  // Tracked so we can preview the delivery fee and validate coupons live.
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => setHydrated(true), []);

  const subtotal = getSubtotal();

  const shipping = useMemo(
    () => computeShipping(shippingZones, province, district, subtotal),
    [shippingZones, province, district, subtotal]
  );

  // The delivery fee depends on the destination, so it's unknown until both
  // province and district are entered. Until then we neither display it nor add
  // it to the total — otherwise the fallback ("Rest of Nepal") zone fee would be
  // silently baked into the total while the shipping line still reads
  // "Enter address".
  const addressComplete = Boolean(province && district);
  const shippingFee = addressComplete ? shipping.fee : 0;

  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  // Keep the discount honest if the cart subtotal changes after applying.
  useEffect(() => {
    if (coupon && discount > subtotal) setCoupon(null);
  }, [coupon, discount, subtotal]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setApplying(true);
    setCouponError('');
    const res = await validateCoupon({ code, subtotal, phone });
    setApplying(false);
    if (!res.ok) {
      setCoupon(null);
      setCouponError(res.error);
      return;
    }
    setCoupon({ code: code.toUpperCase(), discount: res.discount, label: res.label });
    toast.success('Coupon applied!');
  };

  if (hydrated && items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-4">
          <Link href="/products">Shop Now</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const result = await createOrder({
      customerName: String(formData.get('customerName') || ''),
      customerEmail: String(formData.get('customerEmail') || ''),
      customerPhone: String(formData.get('customerPhone') || ''),
      shippingProvince: String(formData.get('shippingProvince') || ''),
      shippingDistrict: String(formData.get('shippingDistrict') || ''),
      shippingMunicipality: String(formData.get('shippingMunicipality') || ''),
      shippingWard: String(formData.get('shippingWard') || ''),
      shippingAddress: String(formData.get('shippingAddress') || ''),
      shippingLandmark: String(formData.get('shippingLandmark') || ''),
      shippingLat: String(formData.get('shippingLat') || ''),
      shippingLng: String(formData.get('shippingLng') || ''),
      notes: String(formData.get('notes') || ''),
      couponCode: coupon?.code,
      paymentMethod: formData.get('paymentMethod') as PaymentMethodKey,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    });

    if (!result.ok) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }

    clearCart();
    const method = formData.get('paymentMethod');

    // Cash on Delivery — no gateway, straight to the order page
    if (method === 'cod') {
      router.push(`/order/${result.orderId}?status=success`);
      return;
    }

    // Khalti returns redirectUrl directly
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
      return;
    }

    // eSewa / Fonepay: go to a server page that submits the form to the gateway
    router.push(`/checkout/pay/${method}?orderId=${result.orderId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerName">Full Name *</Label>
              <Input id="customerName" name="customerName" required />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                required
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="customerEmail">Email (optional)</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                placeholder="For order updates & tracking"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="shippingProvince">Province *</Label>
              <Select
                id="shippingProvince"
                name="shippingProvince"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="" disabled>Select province</option>
                {NEPAL_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="shippingDistrict">District *</Label>
              <Input
                id="shippingDistrict"
                name="shippingDistrict"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="shippingMunicipality">Municipality / VDC *</Label>
              <Input id="shippingMunicipality" name="shippingMunicipality" required />
            </div>
            <div>
              <Label htmlFor="shippingWard">Ward No.</Label>
              <Input id="shippingWard" name="shippingWard" placeholder="e.g. 5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="shippingAddress">Street Address / Tole *</Label>
              <Input id="shippingAddress" name="shippingAddress" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="shippingLandmark">Landmark (optional)</Label>
              <Input
                id="shippingLandmark"
                name="shippingLandmark"
                placeholder="Near... / Opposite to..."
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Order Notes (optional)</Label>
              <Input id="notes" name="notes" placeholder="Anything we should know?" />
            </div>
          </div>

          {/* Map pin */}
          <div className="mt-6 pt-6 border-t">
            <Label className="mb-2 block">Pin your location on the map (optional)</Label>
            <LocationPicker />
          </div>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <div className="space-y-3">
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-destructive">
                No payment methods are currently available. Please contact us.
              </p>
            ) : (
              paymentMethods.map((m) => (
                <PaymentOption
                  key={m.key}
                  value={m.key}
                  label={m.label}
                  desc={m.description}
                  checked={paymentMethod === m.key}
                  onChange={() => setPaymentMethod(m.key)}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Order summary */}
      <aside className="rounded-lg border p-6 h-fit md:sticky md:top-20">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || ''}`}
              className="flex gap-3 text-sm"
            >
              <div className="flex-1">
                <p className="font-medium line-clamp-1">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="mt-4 border-t pt-4">
          {coupon ? (
            <div className="flex items-center justify-between rounded-md bg-green-50 px-3 py-2 text-sm">
              <span className="font-medium text-green-800">{coupon.label}</span>
              <button
                type="button"
                onClick={() => {
                  setCoupon(null);
                  setCouponInput('');
                }}
                className="text-xs text-green-700 underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  className="uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={applying || !couponInput.trim()}
                >
                  {applying ? '...' : 'Apply'}
                </Button>
              </div>
              {couponError && (
                <p className="mt-1.5 text-xs text-destructive">{couponError}</p>
              )}
            </>
          )}
        </div>

        <div className="mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>− {formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Shipping
              {shipping.zoneName && (
                <span className="text-xs"> ({shipping.zoneName})</span>
              )}
            </span>
            <span>
              {!addressComplete ? (
                <span className="text-xs text-muted-foreground">Enter address</span>
              ) : shipping.isFree || shippingFee === 0 ? (
                'Free'
              ) : (
                formatPrice(shippingFee)
              )}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-6"
          disabled={submitting || items.length === 0}
        >
          {submitting
            ? 'Placing order...'
            : paymentMethod === 'cod'
              ? `Place order — ${formatPrice(total)}`
              : `Pay ${formatPrice(total)}`}
        </Button>
      </aside>
    </form>
  );
}

function PaymentOption({
  value,
  label,
  desc,
  checked,
  onChange,
}: {
  value: string;
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4"
        required
      />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </label>
  );
}
