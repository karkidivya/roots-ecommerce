import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { products as productsTable, categories as categoriesTable } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { ProductCard } from '@/components/shop/product-card';
import type { Metadata } from 'next';

export const revalidate = 300;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const BRAND = process.env.NEXT_PUBLIC_APP_NAME || 'Grain Roots';

export async function generateStaticParams() {
  const all = await db.select({ slug: categoriesTable.slug }).from(categoriesTable);
  return all.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [category] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug))
    .limit(1);
  if (!category) return { title: 'Not found' };

  const title = `Buy ${category.name} Online in Nepal`;
  const description =
    category.description ||
    `Shop ${category.name} from ${BRAND}. Farmer-direct, home delivery across Nepal, cash on delivery available.`;

  return {
    title,
    description,
    alternates: { canonical: `${APP_URL}/category/${category.slug}` },
    openGraph: {
      title: `${title} · ${BRAND}`,
      description,
      images: category.imageUrl ? [category.imageUrl] : [],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug))
    .limit(1);
  if (!category) notFound();

  const items = await db
    .select()
    .from(productsTable)
    .where(
      and(eq(productsTable.categoryId, category.id), eq(productsTable.isActive, true))
    );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} — ${BRAND}`,
    url: `${APP_URL}/category/${category.slug}`,
    description: category.description || undefined,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: APP_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: category.name,
          item: `${APP_URL}/category/${category.slug}`,
        },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${APP_URL}/products/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold">{category.name}</h1>
      {category.description && (
        <p className="mt-2 text-muted-foreground">{category.description}</p>
      )}
      <p className="mt-4 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? 'product' : 'products'}
      </p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
