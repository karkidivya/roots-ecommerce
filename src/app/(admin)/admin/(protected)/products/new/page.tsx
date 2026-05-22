import Link from 'next/link';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ProductForm } from '../product-form';
import { createProduct } from '../actions';

export default async function NewProductPage() {
  const cats = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.isActive, true));

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to products
        </Link>
        <h1 className="text-3xl font-bold mt-2">Add Product</h1>
      </div>
      <ProductForm action={createProduct} categories={cats} submitLabel="Create Product" />
    </div>
  );
}
