import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { products as productsTable, categories as categoriesTable } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { ProductCard } from '@/components/shop/product-card';

export const revalidate = 300;

export async function generateStaticParams() {
  const all = await db.select({ slug: categoriesTable.slug }).from(categoriesTable);
  return all.map((c) => ({ slug: c.slug }));
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

  return (
    <div className="container mx-auto px-4 py-8">
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
