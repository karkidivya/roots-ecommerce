import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fromPaisa } from '@/lib/utils';
import type { Product, Category } from '@/lib/db/schema';
import { ImageUploader } from './image-uploader';

interface Props {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  categories: Pick<Category, 'id' | 'name'>[];
  submitLabel: string;
}

export function ProductForm({ action, product, categories, submitLabel }: Props) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Basic Info</h2>
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required defaultValue={product?.name} />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL-friendly, optional)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={product?.slug}
            placeholder="auto-generated from name"
          />
        </div>
        <div>
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input
            id="shortDescription"
            name="shortDescription"
            defaultValue={product?.shortDescription || ''}
            placeholder="Brief tagline (shown on cards)"
          />
        </div>
        <div>
          <Label htmlFor="description">Full Description</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={product?.description || ''}
            rows={6}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId || ''}
          >
            <option value="">— No category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Pricing & Inventory</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">Price (Rs) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product ? fromPaisa(product.price) : ''}
            />
          </div>
          <div>
            <Label htmlFor="compareAtPrice">Compare-at Price (Rs)</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={
                product?.compareAtPrice ? fromPaisa(product.compareAtPrice) : ''
              }
              placeholder="For showing discount"
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              required
              defaultValue={product?.stock ?? 0}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku || ''} />
        </div>
      </section>

      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Images</h2>
        <ImageUploader name="images" initial={product?.images || []} />
      </section>

      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Visibility & Order</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="h-4 w-4"
          />
          <span className="text-sm">Active (visible in storefront)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product?.isFeatured ?? false}
            className="h-4 w-4"
          />
          <span className="text-sm">Featured (shown on homepage)</span>
        </label>
        <div className="pt-2">
          <Label htmlFor="sortOrder">Sort priority</Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={product?.sortOrder ?? 0}
            className="max-w-xs"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lower number = appears earlier in the storefront. Use small numbers
            (1, 2, 3…) for headline products. Leave at 0 to fall back to recency.
          </p>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="submit" size="lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
