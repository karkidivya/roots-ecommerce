import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { PrintTrigger } from './print-trigger';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = { title: 'Receipt' };

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoprint?: string }>;
}) {
  const { id } = await params;
  const { autoprint } = await searchParams;
  if (!UUID_RE.test(id)) notFound();

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  const brand = process.env.NEXT_PUBLIC_APP_NAME || 'Grain Roots';
  const placed = new Date(order.createdAt).toLocaleString('en-NP', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Print-only stylesheet */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          @page { margin: 18mm; }
        }
      `}</style>

      {autoprint && <PrintTrigger />}

      {/* Top toolbar (hidden on print) */}
      <div className="no-print sticky top-0 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <a href={`/order/${id}`} className="text-sm hover:text-muted-foreground">
            ← Back to order
          </a>
          <PrintTrigger asButton />
        </div>
      </div>

      {/* Receipt body */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-3xl">
        <div className="border bg-card p-6 sm:p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b">
            <div>
              <h1 className="font-serif text-3xl">{brand}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Heritage food from the Himalayas
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-mono">{order.orderNumber}</p>
              <p className="text-muted-foreground mt-1">{placed}</p>
            </div>
          </div>

          {/* Bill to / payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-xs mb-8">
            <div>
              <p className="uppercase tracking-wider text-muted-foreground mb-2">
                Bill to
              </p>
              <p className="font-medium text-sm">{order.customerName}</p>
              <p>{order.customerPhone}</p>
              <p>{order.customerEmail}</p>
              <p className="mt-2">{order.shippingAddress}</p>
              {order.shippingLandmark && <p>Landmark: {order.shippingLandmark}</p>}
              <p>
                Ward {order.shippingWard}, {order.shippingMunicipality}
              </p>
              <p>
                {order.shippingDistrict}, {order.shippingProvince}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="uppercase tracking-wider text-muted-foreground mb-2">
                Payment
              </p>
              <p className="font-medium text-sm uppercase">{order.paymentMethod}</p>
              <p className="capitalize">{order.paymentStatus}</p>
              {order.paymentReference && (
                <p className="font-mono mt-1">{order.paymentReference}</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 text-left font-medium">Item</th>
                <th className="py-2 text-right font-medium w-16">Qty</th>
                <th className="py-2 text-right font-medium w-28">Price</th>
                <th className="py-2 text-right font-medium w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3">
                    <p className="font-medium">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    )}
                  </td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">{formatPrice(item.price)}</td>
                  <td className="py-3 text-right">{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-6 text-sm">
            <div className="w-full sm:w-64 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center text-xs text-muted-foreground">
            <p>Thank you for shopping with {brand}.</p>
            <p className="mt-1">Questions? foodgrainroots@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
