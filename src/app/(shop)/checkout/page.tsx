import { db } from '@/lib/db';
import { paymentMethodConfig } from '@/lib/db/schema';
import { and, eq, asc } from 'drizzle-orm';
import { CheckoutForm } from './checkout-form';

export const metadata = { title: 'Checkout' };
export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const methods = await db
    .select({
      key: paymentMethodConfig.key,
      label: paymentMethodConfig.label,
      description: paymentMethodConfig.description,
    })
    .from(paymentMethodConfig)
    .where(eq(paymentMethodConfig.isEnabled, true))
    .orderBy(asc(paymentMethodConfig.sortOrder));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <CheckoutForm
        paymentMethods={methods.map((m) => ({
          key: m.key as 'esewa' | 'khalti' | 'fonepay' | 'cod',
          label: m.label,
          description: m.description || '',
        }))}
      />
    </div>
  );
}
