'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/cart/store';
import { formatPrice, NEPAL_PROVINCES } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createOrder } from './actions';

export function CheckoutForm() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const subtotal = getSubtotal();
  const shippingFee = 10000;
  const total = subtotal + shippingFee;

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
      notes: String(formData.get('notes') || ''),
      paymentMethod: formData.get('paymentMethod') as 'esewa' | 'khalti' | 'fonepay',
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

    // Khalti returns redirectUrl directly
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
      return;
    }

    // eSewa / Fonepay: go to a server page that submits the form to the gateway
    const method = formData.get('paymentMethod');
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
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="customerEmail">Email *</Label>
              <Input id="customerEmail" name="customerEmail" type="email" required />
            </div>
          </div>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="shippingProvince">Province *</Label>
              <Select id="shippingProvince" name="shippingProvince" required defaultValue="">
                <option value="" disabled>Select province</option>
                {NEPAL_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="shippingDistrict">District *</Label>
              <Input id="shippingDistrict" name="shippingDistrict" required />
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
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <div className="space-y-3">
            <PaymentOption value="esewa" label="eSewa" desc="Pay via eSewa wallet" />
            <PaymentOption value="khalti" label="Khalti" desc="Pay via Khalti wallet" />
            <PaymentOption value="fonepay" label="Fonepay" desc="Pay via Fonepay QR / mobile banking" />
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

        <div className="mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(shippingFee)}</span>
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
          {submitting ? 'Placing order...' : `Pay ${formatPrice(total)}`}
        </Button>
      </aside>
    </form>
  );
}

function PaymentOption({
  value,
  label,
  desc,
}: {
  value: string;
  label: string;
  desc: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        defaultChecked={value === 'esewa'}
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
