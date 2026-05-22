import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/db/schema';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0] || '/placeholder.svg';
  const outOfStock = product.stock <= 0;
  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

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
        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-background/60">
            <span className="text-[11px] uppercase tracking-[0.2em]">
              Sold out
            </span>
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
