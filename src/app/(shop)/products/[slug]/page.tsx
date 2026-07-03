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
import { whatsappLink } from '@/components/shop/whatsapp-widget';
import { MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const BRAND = process.env.NEXT_PUBLIC_APP_NAME || 'Grain Roots';

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

  const productUrl = `${APP_URL}/products/${product.slug}`;
  const waLink = whatsappLink(
    `Hi! I'd like to order: ${product.name} — ${productUrl}`
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.shortDescription || product.description?.slice(0, 300) || product.name,
    image: product.images?.length ? product.images : undefined,
    sku: product.sku || undefined,
    brand: { '@type': 'Brand', name: BRAND },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'NPR',
      price: (product.price / 100).toFixed(2),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-xs text-muted-foreground mb-6 flex flex-wrap items-center gap-x-1">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/category/${category.slug}`} className="hover:text-foreground">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:gap-12 md:grid-cols-2">
        <ProductGallery images={product.images || []} alt={product.name} />

        <div className="md:pt-2">
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight text-balance">
            {product.name}
          </h1>
          {product.shortDescription && (
            <p className="mt-3 text-muted-foreground">{product.shortDescription}</p>
          )}

          <div className="mt-5 flex items-baseline flex-wrap gap-3">
            <span className="font-serif text-2xl sm:text-3xl">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          <p className="mt-3 text-sm">
            {product.stock > 0 ? (
              <span className="text-foreground/70">
                In stock — {product.stock} available
              </span>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </p>

          <div className="mt-7">
            <AddToCartButton product={product} />
          </div>

          {waLink && product.stock > 0 && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-[#25D366] px-4 py-3 text-sm font-medium text-[#128C7E] transition-colors hover:bg-[#25D366]/10"
            >
              <MessageCircle className="h-4 w-4" />
              Order via WhatsApp
            </a>
          )}

          {product.description && (
            <div className="mt-10 pt-8 border-t">
              <p className="eyebrow mb-3">Description</p>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t space-y-1.5 text-xs text-muted-foreground">
            {product.sku && <p>SKU: {product.sku}</p>}
            <p>Payment: eSewa · Khalti · Fonepay</p>
            <p>Delivery nationwide across Nepal</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 sm:mt-24 pt-10 border-t">
          <h2 className="font-serif text-2xl sm:text-3xl mb-8">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
