import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import {
  siteSections,
  products as productsTable,
  categories as categoriesTable,
} from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CategoryImagePicker } from '../../categories/image-picker';
import { SectionProductPicker } from '../product-picker';
import { updateSection } from '../actions';

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [section] = await db
    .select()
    .from(siteSections)
    .where(eq(siteSections.id, id))
    .limit(1);
  if (!section) notFound();

  const showImage = ['hero', 'editorial'].includes(section.key);
  const showBody = ['statement', 'editorial', 'hero', 'wholesale-cta'].includes(section.key);
  const showCtas = ['hero', 'editorial', 'wholesale-cta'].includes(section.key);
  const showProductPicker = ['featured-products', 'new-arrivals'].includes(section.key);

  // Load product catalog only when this section needs it
  const products = showProductPicker
    ? await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          price: productsTable.price,
          images: productsTable.images,
          isActive: productsTable.isActive,
          isFeatured: productsTable.isFeatured,
          categoryName: categoriesTable.name,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .orderBy(asc(productsTable.name))
    : [];

  const action = updateSection.bind(null, id);

  const fallbackHint =
    section.key === 'featured-products'
      ? 'Falls back to products marked as "Featured" on their product page.'
      : section.key === 'new-arrivals'
        ? 'Falls back to the 8 most recently created products.'
        : undefined;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/sections"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to sections
        </Link>
        <h1 className="text-3xl font-bold mt-2">{section.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Section key: <code className="font-mono">{section.key}</code>
        </p>
      </div>

      <form action={action} className="space-y-6 max-w-3xl">
        <section className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Content</h2>
          <div>
            <Label htmlFor="eyebrow">Eyebrow (small uppercase label)</Label>
            <Input
              id="eyebrow"
              name="eyebrow"
              defaultValue={section.eyebrow || ''}
              placeholder="e.g. Field note"
            />
          </div>
          <div>
            <Label htmlFor="heading">Heading</Label>
            <Input
              id="heading"
              name="heading"
              defaultValue={section.heading || ''}
              placeholder="Main section title"
            />
          </div>
          {showBody && (
            <div>
              <Label htmlFor="body">Body text</Label>
              <textarea
                id="body"
                name="body"
                rows={5}
                defaultValue={section.body || ''}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}
        </section>

        {showImage && (
          <section className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Image</h2>
            <CategoryImagePicker name="imageUrl" initial={section.imageUrl || ''} />
          </section>
        )}

        {showProductPicker && (
          <section className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Products</h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Pick the products to show in this section. Reorder by clicking the
              arrow on each selected product. Leave empty to use the default
              automatic behavior.
            </p>
            <SectionProductPicker
              name="productIds"
              initial={(section.productIds as string[]) || []}
              products={products}
              fallbackHint={fallbackHint}
            />
          </section>
        )}

        {showCtas && (
          <section className="rounded-lg border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Call-to-action buttons</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cta1Text">Primary button text</Label>
                <Input id="cta1Text" name="cta1Text" defaultValue={section.cta1Text || ''} />
              </div>
              <div>
                <Label htmlFor="cta1Href">Primary button link</Label>
                <Input
                  id="cta1Href"
                  name="cta1Href"
                  defaultValue={section.cta1Href || ''}
                  placeholder="/products"
                />
              </div>
              <div>
                <Label htmlFor="cta2Text">Secondary button text</Label>
                <Input id="cta2Text" name="cta2Text" defaultValue={section.cta2Text || ''} />
              </div>
              <div>
                <Label htmlFor="cta2Href">Secondary button link</Label>
                <Input
                  id="cta2Href"
                  name="cta2Href"
                  defaultValue={section.cta2Href || ''}
                  placeholder="/category/honey"
                />
              </div>
            </div>
          </section>
        )}

        <section className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Display</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={section.sortOrder}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Lower numbers render higher on the page.
              </p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isEnabled"
                  defaultChecked={section.isEnabled}
                  className="h-4 w-4"
                />
                <span className="text-sm">Show this section on the homepage</span>
              </label>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/sections">Cancel</Link>
          </Button>
          <Button type="submit" size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
