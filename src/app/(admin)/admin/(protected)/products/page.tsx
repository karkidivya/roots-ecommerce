import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { products as productsTable, categories } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DeleteProductButton } from './delete-button';
import { toggleProductActive } from './actions';
import { Eye, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const items = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      slug: productsTable.slug,
      price: productsTable.price,
      stock: productsTable.stock,
      images: productsTable.images,
      isActive: productsTable.isActive,
      isFeatured: productsTable.isFeatured,
      categoryName: categories.name,
    })
    .from(productsTable)
    .leftJoin(categories, eq(productsTable.categoryId, categories.id))
    .orderBy(desc(productsTable.createdAt));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="p-3 text-left font-medium">Image</th>
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Category</th>
              <th className="p-3 text-right font-medium">Price</th>
              <th className="p-3 text-right font-medium">Stock</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                    {p.images?.[0] && (
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <p className="font-medium">{p.name}</p>
                  {p.isFeatured && (
                    <span className="text-xs text-primary">★ Featured</span>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">
                  {p.categoryName || '—'}
                </td>
                <td className="p-3 text-right">{formatPrice(p.price)}</td>
                <td className="p-3 text-right">
                  <span
                    className={
                      p.stock === 0
                        ? 'text-destructive'
                        : p.stock < 10
                        ? 'text-yellow-600'
                        : ''
                    }
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="p-3">
                  <form action={toggleProductActive.bind(null, p.id, !p.isActive)}>
                    <button
                      type="submit"
                      title={p.isActive ? 'Click to hide from storefront' : 'Click to show on storefront'}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p.isActive ? (
                        <>
                          <Eye className="h-3 w-3" /> Live
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Hidden
                        </>
                      )}
                    </button>
                  </form>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/products/${p.id}`}>Edit</Link>
                    </Button>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  No products yet.{' '}
                  <Link href="/admin/products/new" className="text-primary hover:underline">
                    Add your first product
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
