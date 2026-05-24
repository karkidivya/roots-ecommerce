'use client';

import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart/store';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/db/schema';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0] || '/placeholder.svg';
  const outOfStock = product.stock <= 0;
  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleAdd = (e: React.MouseEvent) => {
    // Stop the surrounding <Link> from navigating
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image,
      price: product.price,
      quantity: 1,
      maxStock: product.stock,
    });
    toast.success(`${product.name} added to cart`);
    openCart();
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-opacity duration-500 group-hover:opacity-90"
        />

        {outOfStock ? (
          <div className="absolute inset-0 grid place-items-center bg-background/60">
            <span className="text-[11px] uppercase tracking-[0.2em]">
              Sold out
            </span>
          </div>
        ) : (
          // Quick-add overlay:
          //  • Desktop (hover-capable): hidden, slides up + fades in on hover
          //  • Touch devices: always visible (no hover state)
          <div
            className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3
              opacity-100 translate-y-0
              [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-2
              [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0
              transition-all duration-300"
          >
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Add ${product.name} to cart`}
              className="w-full h-9 rounded-sm bg-background/95 backdrop-blur-sm text-foreground text-xs font-medium hover:bg-background flex items-center justify-center gap-2 shadow-soft"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Quick add
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 space-y-1">
        <h3 className="font-serif text-[15px] leading-snug line-clamp-2">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.shortDescription}
          </p>
        )}
        <div className="pt-1 flex items-baseline gap-2 text-sm">
          <span>{formatPrice(product.price)}</span>
          {onSale && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
