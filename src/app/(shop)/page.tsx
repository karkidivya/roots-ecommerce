import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import {
  products as productsTable,
  categories as categoriesTable,
  siteSections,
} from '@/lib/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { ProductCard } from '@/components/shop/product-card';
import {
  HeroSection,
  StatementSection,
  EditorialSection,
  SectionHeader,
} from '@/components/shop/home-sections';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featured, latest, cats, sections] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(eq(productsTable.isFeatured, true))
      .limit(8),
    db
      .select()
      .from(productsTable)
      .where(eq(productsTable.isActive, true))
      .orderBy(desc(productsTable.createdAt))
      .limit(8),
    db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(asc(categoriesTable.sortOrder))
      .limit(6),
    db
      .select()
      .from(siteSections)
      .where(eq(siteSections.isEnabled, true))
      .orderBy(asc(siteSections.sortOrder)),
  ]);

  // Render each enabled section in admin-defined order
  return (
    <>
      {sections.map((s) => {
        switch (s.key) {
          case 'hero':
            return <HeroSection key={s.id} s={s} />;
          case 'statement':
            return <StatementSection key={s.id} s={s} />;
          case 'featured-products':
            if (featured.length === 0) return null;
            return (
              <section key={s.id} className="container mx-auto px-6 pb-24">
                <SectionHeader s={s} viewAllHref="/products" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                  {featured.slice(0, 4).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            );
          case 'editorial':
            return <EditorialSection key={s.id} s={s} />;
          case 'categories-grid':
            return (
              <section key={s.id} className="container mx-auto px-6 py-24">
                <SectionHeader s={s} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                  {cats.map((c) => (
                    <Link key={c.id} href={`/category/${c.slug}`} className="group block">
                      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                        {c.imageUrl && (
                          <Image
                            src={c.imageUrl}
                            alt={c.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover transition-opacity duration-500 group-hover:opacity-90"
                          />
                        )}
                      </div>
                      <div className="pt-4 flex items-baseline justify-between">
                        <h3 className="font-serif text-lg">{c.name}</h3>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          Shop →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          case 'new-arrivals':
            return (
              <section key={s.id} className="container mx-auto px-6 py-24">
                <SectionHeader s={s} viewAllHref="/products" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                  {latest.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
