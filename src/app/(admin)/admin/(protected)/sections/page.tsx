import Link from 'next/link';
import { db } from '@/lib/db';
import { siteSections, type SiteSection } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { toggleSection } from './actions';
import { Eye, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSectionsPage() {
  const items = await db
    .select()
    .from(siteSections)
    .orderBy(asc(siteSections.sortOrder));

  const aboutRows = items.filter((s) => s.key.startsWith('about-'));
  const homeRows = items.filter((s) => !s.key.startsWith('about-'));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Website Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit, reorder, or hide sections across the homepage and About page.
        </p>
      </div>

      <SectionsTable
        title="Homepage"
        subtitle="Sections on /"
        rows={homeRows}
      />

      <SectionsTable
        title="About page"
        subtitle="Sections on /about"
        rows={aboutRows}
      />
    </div>
  );
}

function SectionsTable({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: SiteSection[];
}) {
  return (
    <div className="mb-10">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="font-serif text-xl">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="p-3 text-left font-medium w-16">Order</th>
              <th className="p-3 text-left font-medium">Section</th>
              <th className="p-3 text-left font-medium">Preview</th>
              <th className="p-3 text-left font-medium">Visibility</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const toggleAction = toggleSection.bind(null, s.id, !s.isEnabled);
              return (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {s.sortOrder}
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{s.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {s.key}
                    </p>
                  </td>
                  <td className="p-3 max-w-md">
                    {s.eyebrow && (
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {s.eyebrow}
                      </p>
                    )}
                    {s.heading && (
                      <p className="font-serif text-sm line-clamp-1">
                        {s.heading}
                      </p>
                    )}
                    {s.body && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {s.body}
                      </p>
                    )}
                  </td>
                  <td className="p-3">
                    <form action={toggleAction}>
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          s.isEnabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s.isEnabled ? (
                          <>
                            <Eye className="h-3 w-3" /> Visible
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
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/sections/${s.id}`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted-foreground">
                  No sections yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
