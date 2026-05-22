import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { decodeEsewaResponse, verifyEsewaPayment } from '@/lib/payments/esewa';
import { fromPaisa } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const data = searchParams.get('data');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!orderId || !data) {
    return NextResponse.redirect(`${appUrl}/order/error?reason=missing-params`);
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.redirect(`${appUrl}/order/error?reason=not-found`);
  }

  const decoded = decodeEsewaResponse(data);
  if (!decoded) {
    return NextResponse.redirect(`${appUrl}/order/${orderId}?status=failed`);
  }

  // Verify with eSewa server-to-server status check
  const verify = await verifyEsewaPayment(decoded.transaction_uuid, fromPaisa(order.total));

  if (verify?.status === 'COMPLETE') {
    await db
      .update(orders)
      .set({
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentReference: decoded.transaction_code,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
    return NextResponse.redirect(`${appUrl}/order/${orderId}?status=success`);
  }

  await db
    .update(orders)
    .set({ paymentStatus: 'failed', updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  return NextResponse.redirect(`${appUrl}/order/${orderId}?status=failed`);
}
