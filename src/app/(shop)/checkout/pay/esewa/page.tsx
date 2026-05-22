import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getEsewaFormData } from '@/lib/payments/esewa';
import { fromPaisa } from '@/lib/utils';
import { EsewaAutoSubmit } from './auto-submit';

export default async function EsewaPayPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.paymentStatus === 'paid') notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const formData = getEsewaFormData({
    amount: fromPaisa(order.total),
    productCode: order.orderNumber,
    successUrl: `${appUrl}/api/payment/esewa/verify?orderId=${order.id}`,
    failureUrl: `${appUrl}/order/${order.id}?status=failed`,
  });

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      <h1 className="text-2xl font-bold mb-2">Redirecting to eSewa...</h1>
      <p className="text-muted-foreground mb-6">
        Please wait while we redirect you to the eSewa payment gateway.
      </p>
      <EsewaAutoSubmit formData={formData} />
    </div>
  );
}
