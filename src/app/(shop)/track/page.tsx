import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { and, ilike, or } from 'drizzle-orm';
import { Search } from 'lucide-react';

export const metadata = {
  title: 'Track Order',
  description: 'Track the status of your order.',
};

async function lookupOrder(formData: FormData) {
  'use server';
  const orderNumber = String(formData.get('orderNumber') || '').trim();
  const contact = String(formData.get('contact') || '').trim().toLowerCase();

  if (!orderNumber || !contact) {
    redirect(`/track?error=missing`);
  }

  // Match by orderNumber AND (email OR phone) — case-insensitive
  const [order] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        ilike(orders.orderNumber, orderNumber),
        or(
          ilike(orders.customerEmail, contact),
          ilike(orders.customerPhone, contact)
        )
      )
    )
    .limit(1);

  if (!order) {
    redirect(`/track?error=not-found`);
  }

  redirect(`/order/${order.id}`);
}

const ERRORS: Record<string, string> = {
  missing: 'Please fill in both fields.',
  'not-found':
    "We couldn't find an order matching those details. Double-check the order number and email.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; orderNumber?: string }>;
}) {
  const { error, orderNumber } = await searchParams;
  const errorMessage = error && ERRORS[error];

  return (
    <div className="container mx-auto px-6 py-20 md:py-28">
      <div className="max-w-lg mx-auto">
        <p className="eyebrow mb-4">Track order</p>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] text-balance">
          Where&apos;s my order?
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
          Enter your order number and the email you used at checkout — we&apos;ll
          show you the current status and full details.
        </p>

        <form action={lookupOrder} className="mt-10 space-y-4">
          <div>
            <label
              htmlFor="orderNumber"
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground block mb-2"
            >
              Order number <span className="text-foreground">*</span>
            </label>
            <input
              id="orderNumber"
              name="orderNumber"
              type="text"
              required
              autoFocus
              defaultValue={orderNumber || ''}
              placeholder="e.g. ORD-A1B2C3"
              className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="contact"
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground block mb-2"
            >
              Email or phone <span className="text-foreground">*</span>
            </label>
            <input
              id="contact"
              name="contact"
              type="text"
              required
              placeholder="The email or phone you used at checkout"
              className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-sm bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/85"
          >
            <Search className="h-4 w-4" />
            Track order
          </button>
        </form>

        <div className="mt-12 pt-8 border-t text-xs text-muted-foreground">
          <p>
            Lost your order number? Check the confirmation email we sent after
            checkout, or email us at{' '}
            <a className="text-foreground hover:underline" href="mailto:karkidivya5@gmail.com">
              karkidivya5@gmail.com
            </a>{' '}
            with your phone number and we&apos;ll find it.
          </p>
        </div>
      </div>
    </div>
  );
}
