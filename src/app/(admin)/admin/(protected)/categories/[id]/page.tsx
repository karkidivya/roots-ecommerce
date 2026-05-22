import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CategoryForm } from '../category-form';
import { updateCategory } from '../actions';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  if (!category) notFound();

  const updateAction = updateCategory.bind(null, id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to categories
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Category</h1>
        <p className="text-sm text-muted-foreground mt-1">{category.name}</p>
      </div>
      <CategoryForm
        action={updateAction}
        category={category}
        submitLabel="Save Changes"
      />
    </div>
  );
}
