import { db } from '@/lib/db';
import { paymentMethodConfig, shippingZones } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { CheckoutForm } from './checkout-form';
import type { ShippingZoneLite } from '@/lib/shipping';

export const metadata = { title: 'Checkout' };
export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const [methods, zones] = await Promise.all([
    db
      .select({
        key: paymentMethodConfig.key,
        label: paymentMethodConfig.label,
        description: paymentMethodConfig.description,
      })
      .from(paymentMethodConfig)
      .where(eq(paymentMethodConfig.isEnabled, true))
      .orderBy(asc(paymentMethodConfig.sortOrder)),
    db.select().from(shippingZones).where(eq(shippingZones.isActive, true)),
  ]);

  const zonesLite: ShippingZoneLite[] = zones.map((z) => ({
    name: z.name,
    matchType: z.matchType,
    matchValue: z.matchValue,
    fee: z.fee,
    freeAbove: z.freeAbove,
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <CheckoutForm
        paymentMethods={methods.map((m) => ({
          key: m.key as 'esewa' | 'khalti' | 'fonepay' | 'cod',
          label: m.label,
          description: m.description || '',
        }))}
        shippingZones={zonesLite}
      />
    </div>
  );
}
