import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { formatPrice } from '@/lib/utils';
import { isAdminAuthenticated } from '@/lib/auth';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function updateOrderStatus(orderId: string, formData: FormData) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');
  const status = String(formData.get('status') || '') as
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  const paymentStatus = String(formData.get('paymentStatus') || '') as
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded';

  await db
    .update(orders)
    .set({ status, paymentStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  const updateAction = updateOrderStatus.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to orders
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleString('en-NP', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/order/${order.id}/receipt`} target="_blank">
            Open receipt
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Items</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm border-b pb-3">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-medium">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">Customer</h2>
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.customerName}</p>
              <p>{order.customerPhone}</p>
              <p>{order.customerEmail}</p>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
            <div className="text-sm space-y-1">
              <p>{order.shippingAddress}</p>
              {order.shippingLandmark && <p>Landmark: {order.shippingLandmark}</p>}
              <p>
                Ward {order.shippingWard}, {order.shippingMunicipality}
              </p>
              <p>
                {order.shippingDistrict}, {order.shippingProvince}
              </p>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-1">Customer notes:</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 h-fit md:sticky md:top-4">
          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Update Status</h2>
            <form action={updateAction} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Order Status</label>
                <Select name="status" defaultValue={order.status}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Payment Status</label>
                <Select name="paymentStatus" defaultValue={order.paymentStatus}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Update
              </Button>
            </form>
          </section>

          <section className="rounded-lg border bg-card p-6 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium uppercase">{order.paymentMethod}</span>
            </div>
            {order.paymentReference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs">{order.paymentReference}</span>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
