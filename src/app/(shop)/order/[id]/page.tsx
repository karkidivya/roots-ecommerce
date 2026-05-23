import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OrderTimeline } from '@/components/shop/order-timeline';

export const dynamic = 'force-dynamic';

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;

  // Guard against non-UUID inputs (e.g. /order/error from an old redirect) so
  // Postgres doesn't throw an invalid-uuid syntax error.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) notFound();

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  const isSuccess = order.paymentStatus === 'paid' || status === 'success';
  const isFailed = order.paymentStatus === 'failed' || status === 'failed';

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="rounded-lg border p-8 text-center">
        {isSuccess ? (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
            <h1 className="mt-4 text-2xl font-bold">Order Confirmed!</h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for your order. We'll send a confirmation email shortly.
            </p>
          </>
        ) : isFailed ? (
          <>
            <XCircle className="mx-auto h-16 w-16 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold">Payment Failed</h1>
            <p className="mt-2 text-muted-foreground">
              Your payment was not successful. Please try again.
            </p>
          </>
        ) : (
          <>
            <Clock className="mx-auto h-16 w-16 text-yellow-600" />
            <h1 className="mt-4 text-2xl font-bold">Payment Pending</h1>
            <p className="mt-2 text-muted-foreground">
              We're waiting to confirm your payment.
            </p>
          </>
        )}

        <p className="mt-4 text-sm">
          Order Number: <span className="font-mono font-semibold">{order.orderNumber}</span>
        </p>
      </div>

      {/* Status timeline */}
      {isSuccess && (
        <div className="mt-6 rounded-lg border bg-card p-6">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-5">
            Status
          </h2>
          <OrderTimeline status={order.status} />
          <p className="mt-5 pt-5 border-t text-xs text-muted-foreground">
            Last updated{' '}
            {new Date(order.updatedAt).toLocaleString('en-NP', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
      )}

      <div className="mt-8 rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-muted-foreground">
                  Qty: {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="font-medium">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="text-foreground font-medium">{order.customerName}</p>
          <p>{order.customerPhone} · {order.customerEmail}</p>
          <p>{order.shippingAddress}</p>
          {order.shippingLandmark && <p>Landmark: {order.shippingLandmark}</p>}
          <p>
            Ward {order.shippingWard}, {order.shippingMunicipality}
          </p>
          <p>
            {order.shippingDistrict}, {order.shippingProvince}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="flex-1 min-w-[200px]">
          <Link href="/products">Continue Shopping</Link>
        </Button>
        {isSuccess && (
          <Button asChild variant="outline" className="flex-1 min-w-[200px]">
            <Link href={`/order/${order.id}/receipt`}>Download Receipt</Link>
          </Button>
        )}
        {isFailed && (
          <Button asChild variant="outline" className="flex-1 min-w-[200px]">
            <Link href="/checkout">Try Again</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
