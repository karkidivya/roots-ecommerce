import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { products as productsTable, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ProductForm } from '../product-form';
import { updateProduct } from '../actions';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  if (!product) notFound();

  const cats = await db.select({ id: categories.id, name: categories.name }).from(categories);

  const updateAction = updateProduct.bind(null, id);

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to products
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Product</h1>
        <p className="text-sm text-muted-foreground mt-1">{product.name}</p>
      </div>
      <ProductForm
        action={updateAction}
        product={product}
        categories={cats}
        submitLabel="Save Changes"
      />
    </div>
  );
}
