import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Category } from '@/lib/db/schema';
import { CategoryImagePicker } from './image-picker';

interface Props {
  action: (formData: FormData) => void | Promise<void>;
  category?: Category;
  submitLabel: string;
}

export function CategoryForm({ action, category, submitLabel }: Props) {
  return (
    <form action={action} className="space-y-5 max-w-2xl">
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Details</h2>
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required defaultValue={category?.name} />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL path)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={category?.slug}
            placeholder="auto-generated from name if blank"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Used in URLs like <code>/category/your-slug</code>
          </p>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={category?.description || ''}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <Label>Image</Label>
          <p className="mb-3 text-xs text-muted-foreground">
            Shown on the homepage category card. Upload to Cloudinary or paste any URL.
          </p>
          <CategoryImagePicker name="imageUrl" initial={category?.imageUrl || ''} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={category?.sortOrder ?? 0}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Lower numbers appear first.
            </p>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={category?.isActive ?? true}
                className="h-4 w-4"
              />
              <span className="text-sm">Active (visible in storefront)</span>
            </label>
          </div>
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
