'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/cart/store';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/db/schema';

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const { addItem, openCart } = useCartStore();
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || '/placeholder.svg',
      price: product.price,
      quantity: qty,
      maxStock: product.stock,
    });
    toast.success(`${product.name} added to cart`);
    openCart();
  };

  if (outOfStock) {
    return (
      <Button disabled size="lg" className="w-full">
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex items-center rounded-md border">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="px-3 py-2 hover:bg-accent"
          aria-label="Decrease"
        >
          -
        </button>
        <span className="w-10 text-center font-medium">{qty}</span>
        <button
          onClick={() => setQty(Math.min(product.stock, qty + 1))}
          className="px-3 py-2 hover:bg-accent"
          aria-label="Increase"
        >
          +
        </button>
      </div>
      <Button onClick={handleAdd} size="lg" className="flex-1">
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
      </Button>
    </div>
  );
}
