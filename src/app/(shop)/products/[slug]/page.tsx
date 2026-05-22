import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { products as productsTable, categories as categoriesTable } from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { formatPrice, calculateDiscountPercent } from '@/lib/utils';
import { AddToCartButton } from '@/components/shop/add-to-cart';
import { ProductCard } from '@/components/shop/product-card';
import { ProductGallery } from '@/components/shop/product-gallery';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateStaticParams() {
  const all = await db
    .select({ slug: productsTable.slug })
    .from(productsTable)
    .where(eq(productsTable.isActive, true));
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, slug))
    .limit(1);
  if (!product) return { title: 'Not found' };
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product] = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.slug, slug), eq(productsTable.isActive, true)))
    .limit(1);

  if (!product) notFound();

  const [category, related] = await Promise.all([
    product.categoryId
      ? db
          .select()
          .from(categoriesTable)
          .where(eq(categoriesTable.id, product.categoryId))
          .limit(1)
          .then((r) => r[0])
      : null,
    product.categoryId
      ? db
          .select()
          .from(productsTable)
          .where(
            and(
              eq(productsTable.categoryId, product.categoryId),
              eq(productsTable.isActive, true),
              ne(productsTable.id, product.id)
            )
          )
          .limit(4)
      : [],
  ]);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? calculateDiscountPercent(product.price, product.compareAtPrice)
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/category/${category.slug}`} className="hover:text-primary">
              {category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images || []} alt={product.name} />

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.shortDescription && (
            <p className="mt-2 text-muted-foreground">{product.shortDescription}</p>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-3 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">
                ✓ In stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </p>

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          {product.description && (
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t space-y-2 text-sm text-muted-foreground">
            {product.sku && <p>SKU: {product.sku}</p>}
            <p>Payment: eSewa · Khalti · Fonepay</p>
            <p>Delivery: Nationwide (Nepal)</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
