import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { decodeEsewaResponse, verifyEsewaPayment } from '@/lib/payments/esewa';
import { fromPaisa } from '@/lib/utils';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!UUID_RE.test(orderId)) {
    return NextResponse.redirect(`${appUrl}/checkout/failed?reason=missing-params`);
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.redirect(`${appUrl}/checkout/failed?reason=not-found`);
  }

  // eSewa may omit `data` if the user cancelled — treat as failed, not crash
  const data = req.nextUrl.searchParams.get('data');
  if (!data) {
    await db
      .update(orders)
      .set({ paymentStatus: 'failed', updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    return NextResponse.redirect(`${appUrl}/order/${orderId}?status=failed`);
  }

  const decoded = decodeEsewaResponse(data);
  if (!decoded) {
    return NextResponse.redirect(`${appUrl}/order/${orderId}?status=failed`);
  }

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
