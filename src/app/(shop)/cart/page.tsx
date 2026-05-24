'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/cart/store';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;

  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Start shopping to add items.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="font-serif text-3xl sm:text-4xl mb-8">Shopping cart</h1>
      <div className="grid gap-8 md:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || ''}`}
              className="flex gap-3 sm:gap-4 rounded-sm border p-3 sm:p-4"
            >
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded bg-muted">
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium text-sm sm:text-base hover:text-muted-foreground line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="font-semibold text-sm sm:text-base whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
                {item.variantName && (
                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatPrice(item.price)} each
                </p>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-sm border">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1, item.variantId)
                      }
                      className="p-2 hover:bg-muted"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1, item.variantId)
                      }
                      disabled={item.quantity >= item.maxStock}
                      className="p-2 hover:bg-muted disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-destructive hover:text-destructive/80 p-2"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-sm border p-5 sm:p-6 h-fit md:sticky md:top-24">
          <h2 className="font-serif text-lg mb-4">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping calculated at checkout</p>
          </div>
          <Button asChild size="lg" className="w-full mt-6">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
