import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyFonepayResponse } from '@/lib/payments/fonepay';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!orderId) {
    return NextResponse.redirect(`${appUrl}/checkout/failed?reason=missing-params`);
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.redirect(`${appUrl}/checkout/failed?reason=not-found`);
  }

  const params = {
    PRN: searchParams.get('PRN') || '',
    PID: searchParams.get('PID') || '',
    PS: searchParams.get('PS') || '',
    RC: searchParams.get('RC') || '',
    UID: searchParams.get('UID') || '',
    BC: searchParams.get('BC') || '',
    INI: searchParams.get('INI') || '',
    P_AMT: searchParams.get('P_AMT') || '',
    R_AMT: searchParams.get('R_AMT') || '',
    DV: searchParams.get('DV') || '',
  };

  const isValid = verifyFonepayResponse(params);

  if (isValid && params.PRN === order.orderNumber) {
    await db
      .update(orders)
      .set({
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentReference: params.UID,
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
