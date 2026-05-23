import { Check, Package, Truck, Home, Clock, XCircle, RotateCcw } from 'lucide-react';
import type { Order } from '@/lib/db/schema';

const FLOW: { key: Order['status']; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    key: 'pending',
    label: 'Placed',
    sub: 'Order received',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    sub: 'Payment confirmed',
    icon: <Check className="h-4 w-4" />,
  },
  {
    key: 'processing',
    label: 'Packing',
    sub: 'Being prepared',
    icon: <Package className="h-4 w-4" />,
  },
  {
    key: 'shipped',
    label: 'Shipped',
    sub: 'On the way',
    icon: <Truck className="h-4 w-4" />,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    sub: 'Arrived',
    icon: <Home className="h-4 w-4" />,
  },
];

const STATUS_INDEX: Record<Order['status'], number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
  refunded: -1,
};

export function OrderTimeline({ status }: { status: Order['status'] }) {
  // Terminal/abnormal states get their own treatment
  if (status === 'cancelled' || status === 'refunded') {
    return (
      <div className="rounded-md border bg-muted/30 p-5 flex items-center gap-4">
        <span className="grid place-items-center h-10 w-10 rounded-full bg-destructive/10 text-destructive shrink-0">
          {status === 'cancelled' ? (
            <XCircle className="h-5 w-5" />
          ) : (
            <RotateCcw className="h-5 w-5" />
          )}
        </span>
        <div>
          <p className="font-medium capitalize">{status}</p>
          <p className="text-xs text-muted-foreground">
            {status === 'cancelled'
              ? 'This order was cancelled. If you were charged, a refund is on the way.'
              : 'This order has been refunded.'}
          </p>
        </div>
      </div>
    );
  }

  const activeIndex = STATUS_INDEX[status];

  return (
    <div>
      {/* Mobile (vertical) */}
      <ol className="md:hidden space-y-3">
        {FLOW.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <li key={step.key} className="flex items-start gap-3">
              <span
                className={`mt-0.5 grid place-items-center h-7 w-7 rounded-full shrink-0 ${
                  isDone || isActive
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : step.icon}
              </span>
              <div className="flex-1">
                <p className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.sub}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Desktop (horizontal) */}
      <ol className="hidden md:flex items-start justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-[8%] right-[8%] h-px bg-border -z-0" />
        <div
          className="absolute top-4 left-[8%] h-px bg-foreground -z-0 transition-all"
          style={{
            width:
              activeIndex <= 0
                ? '0%'
                : `${(activeIndex / (FLOW.length - 1)) * 84}%`,
          }}
        />

        {FLOW.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <li
              key={step.key}
              className="relative z-10 flex flex-col items-center text-center w-1/5"
            >
              <span
                className={`grid place-items-center h-8 w-8 rounded-full mb-2 ${
                  isDone || isActive
                    ? 'bg-foreground text-background'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : step.icon}
              </span>
              <p
                className={`text-xs ${
                  isActive ? 'font-medium' : isDone ? '' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {step.sub}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
