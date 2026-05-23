import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REASONS: Record<string, string> = {
  'missing-params': 'The payment gateway sent an incomplete response. Your card was not charged.',
  'not-found': "We couldn't find that order. It may have already been cancelled.",
  cancelled: 'You cancelled the payment.',
  failed: 'The payment was declined or could not be completed.',
};

export const metadata = { title: 'Payment Failed' };

export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const message = (reason && REASONS[reason]) || 'Something went wrong with your payment.';

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <div className="rounded-lg border p-10 text-center">
        <XCircle className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="mt-4 font-serif text-3xl">Payment Failed</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">{message}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          If you were charged, please contact us and we&apos;ll refund within 24 hours.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild>
            <Link href="/checkout">Try again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
