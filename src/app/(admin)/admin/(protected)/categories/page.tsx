import Link from 'next/link';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DeleteCategoryButton } from './delete-button';
import { createCategory, toggleCategoryActive } from './actions';
import { Eye, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const items = await db.select().from(categories).orderBy(asc(categories.sortOrder));

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Categories</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Slug</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {c.slug}
                  </td>
                  <td className="p-3">
                    <form action={toggleCategoryActive.bind(null, c.id, !c.isActive)}>
                      <button
                        type="submit"
                        title={c.isActive ? 'Click to hide from storefront' : 'Click to show on storefront'}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          c.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {c.isActive ? (
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
                        <Link href={`/admin/categories/${c.id}`}>Edit</Link>
                      </Button>
                      <DeleteCategoryButton id={c.id} name={c.name} />
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-muted-foreground">
                    No categories yet. Create one →
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="rounded-lg border bg-card p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Add Category</h2>
          <form action={createCategory} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://..."
              />
            </div>
            <Button type="submit" className="w-full">
              Add Category
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
