import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getFonepayFormData } from '@/lib/payments/fonepay';
import { fromPaisa } from '@/lib/utils';
import { FonepayAutoSubmit } from './auto-submit';

export default async function FonepayPayPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.paymentStatus === 'paid') notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const formData = getFonepayFormData({
    amount: fromPaisa(order.total),
    prn: order.orderNumber,
    returnUrl: `${appUrl}/api/payment/fonepay/verify?orderId=${order.id}`,
    remarks1: `Order ${order.orderNumber}`,
  });

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      <h1 className="text-2xl font-bold mb-2">Redirecting to Fonepay...</h1>
      <p className="text-muted-foreground mb-6">
        Please wait while we redirect you to the Fonepay payment gateway.
      </p>
      <FonepayAutoSubmit formData={formData} />
    </div>
  );
}
