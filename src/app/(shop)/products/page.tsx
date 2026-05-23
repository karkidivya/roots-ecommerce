import Link from 'next/link';
import { db } from '@/lib/db';
import { products as productsTable, categories as categoriesTable } from '@/lib/db/schema';
import { and, eq, gte, lte, ilike, asc, desc, sql, type SQL } from 'drizzle-orm';
import { ProductCard } from '@/components/shop/product-card';

export const revalidate = 60;

interface SearchParams {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: 'featured' | 'newest' | 'price-asc' | 'price-desc';
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const conditions: SQL[] = [eq(productsTable.isActive, true)];

  if (params.category) {
    const cat = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, params.category))
      .limit(1);
    if (cat[0]) conditions.push(eq(productsTable.categoryId, cat[0].id));
  }

  if (params.minPrice) {
    conditions.push(gte(productsTable.price, parseInt(params.minPrice) * 100));
  }
  if (params.maxPrice) {
    conditions.push(lte(productsTable.price, parseInt(params.maxPrice) * 100));
  }
  if (params.q) {
    conditions.push(ilike(productsTable.name, `%${params.q}%`));
  }

  const orderByClauses =
    params.sort === 'price-asc'
      ? [asc(productsTable.price)]
      : params.sort === 'price-desc'
      ? [desc(productsTable.price)]
      : params.sort === 'newest'
      ? [desc(productsTable.createdAt)]
      : // Default "featured": explicit sort_order first (treat 0 = unset = last),
        // then Featured-flagged products, then newest
        [
          sql`CASE WHEN ${productsTable.sortOrder} = 0 THEN 999999 ELSE ${productsTable.sortOrder} END ASC`,
          desc(productsTable.isFeatured),
          desc(productsTable.createdAt),
        ];

  const [items, cats] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(and(...conditions))
      .orderBy(...orderByClauses)
      .limit(48),
    db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true)),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        {/* Filters sidebar */}
        <aside className="space-y-6">
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Search</label>
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Product name..."
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Categories</label>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    href="/products"
                    className={!params.category ? 'font-semibold text-primary' : ''}
                  >
                    All
                  </Link>
                </li>
                {cats.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/products?category=${c.slug}`}
                      className={
                        params.category === c.slug ? 'font-semibold text-primary' : ''
                      }
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Price Range (Rs)</label>
              <div className="flex gap-2">
                <input
                  name="minPrice"
                  type="number"
                  defaultValue={params.minPrice}
                  placeholder="Min"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                />
                <input
                  name="maxPrice"
                  type="number"
                  defaultValue={params.maxPrice}
                  placeholder="Max"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Sort</label>
              <select
                name="sort"
                defaultValue={params.sort || 'featured'}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {params.category && (
              <input type="hidden" name="category" value={params.category} />
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Product grid */}
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {items.length} {items.length === 1 ? 'product' : 'products'}
          </p>
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="text-muted-foreground">No products found.</p>
              <Link href="/products" className="text-primary text-sm hover:underline mt-2 inline-block">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
