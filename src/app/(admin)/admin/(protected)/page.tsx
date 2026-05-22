import { db } from '@/lib/db';
import { orders, products as productsTable, categories } from '@/lib/db/schema';
import { count, sum, eq, desc, gte, sql } from 'drizzle-orm';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    [orderCount],
    [productCount],
    [categoryCount],
    [pendingCount],
    [revenue],
    recentOrders,
  ] = await Promise.all([
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(productsTable),
    db.select({ value: count() }).from(categories),
    db
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.status, 'pending')),
    db
      .select({ value: sum(orders.total) })
      .from(orders)
      .where(
        sql`${orders.paymentStatus} = 'paid' AND ${orders.createdAt} >= ${sevenDaysAgo}`
      ),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
  ]);

  const stats = [
    { label: 'Total Orders', value: orderCount.value },
    { label: 'Pending Orders', value: pendingCount.value },
    { label: 'Products', value: productCount.value },
    { label: 'Categories', value: categoryCount.value },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 mb-8">
        <p className="text-sm text-muted-foreground">Revenue (last 7 days, paid)</p>
        <p className="mt-2 text-3xl font-bold">
          {formatPrice(Number(revenue.value) || 0)}
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between p-6 pb-3">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y bg-muted/30">
              <tr>
                <th className="p-3 text-left font-medium">Order #</th>
                <th className="p-3 text-left font-medium">Customer</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Payment</th>
                <th className="p-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="p-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="p-3">{o.customerName}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3">
                    <PaymentBadge status={o.paymentStatus} />
                  </td>
                  <td className="p-3 text-right font-medium">
                    {formatPrice(o.total)}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs ${
        colors[status] || 'bg-gray-100'
      }`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs ${
        colors[status] || 'bg-gray-100'
      }`}
    >
      {status}
    </span>
  );
}
