import Link from 'next/link';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { and, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface SearchParams {
  q?: string;
  status?: string;
  payment?: string;
}

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

const PAYMENT_OPTIONS = ['pending', 'paid', 'failed', 'refunded'] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const conditions: SQL[] = [];

  if (params.q) {
    const term = `%${params.q}%`;
    conditions.push(
      or(
        ilike(orders.orderNumber, term),
        ilike(orders.customerName, term),
        ilike(orders.customerEmail, term),
        ilike(orders.customerPhone, term)
      )!
    );
  }
  if (params.status && STATUS_OPTIONS.includes(params.status as (typeof STATUS_OPTIONS)[number])) {
    conditions.push(eq(orders.status, params.status as (typeof STATUS_OPTIONS)[number]));
  }
  if (params.payment && PAYMENT_OPTIONS.includes(params.payment as (typeof PAYMENT_OPTIONS)[number])) {
    conditions.push(
      eq(orders.paymentStatus, params.payment as (typeof PAYMENT_OPTIONS)[number])
    );
  }

  const items = await db
    .select()
    .from(orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  const activeFilters = !!(params.q || params.status || params.payment);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? 'order' : 'orders'}
        </p>
      </div>

      {/* Filter bar */}
      <form className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto]">
        <input
          name="q"
          defaultValue={params.q || ''}
          placeholder="Search by order #, name, email, phone…"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={params.status || ''}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="payment"
          defaultValue={params.payment || ''}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All payments</option>
          {PAYMENT_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-foreground text-background px-4 h-10 text-sm font-medium hover:bg-foreground/85"
          >
            Filter
          </button>
          {activeFilters && (
            <Link
              href="/admin/orders"
              className="rounded-md border bg-card px-4 h-10 text-sm flex items-center hover:bg-muted"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="p-3 text-left font-medium">Order #</th>
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Customer</th>
              <th className="p-3 text-left font-medium">Payment</th>
              <th className="p-3 text-left font-medium">Method</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-right font-medium">Total</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleDateString('en-NP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="p-3">
                  <p className="font-medium">{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
                </td>
                <td className="p-3">
                  <PaymentBadge status={o.paymentStatus} />
                </td>
                <td className="p-3 uppercase text-xs">{o.paymentMethod}</td>
                <td className="p-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="p-3 text-right font-medium whitespace-nowrap">
                  {formatPrice(o.total)}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-3 text-xs">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-primary hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/order/${o.id}/receipt`}
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      Receipt
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center text-muted-foreground">
                  {activeFilters ? 'No orders match those filters.' : 'No orders yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
