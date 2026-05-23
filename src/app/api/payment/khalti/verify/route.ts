import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyKhaltiPayment } from '@/lib/payments/khalti';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const pidx = searchParams.get('pidx');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!orderId || !pidx) {
    return NextResponse.redirect(`${appUrl}/checkout/failed?reason=missing-params`);
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.redirect(`${appUrl}/checkout/failed?reason=not-found`);
  }

  try {
    const verify = await verifyKhaltiPayment(pidx);

    if (verify.status === 'Completed' && verify.total_amount === order.total) {
      await db
        .update(orders)
        .set({
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentReference: verify.transaction_id || pidx,
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
  } catch (err) {
    console.error('Khalti verify error', err);
    return NextResponse.redirect(`${appUrl}/order/${orderId}?status=failed`);
  }
}
