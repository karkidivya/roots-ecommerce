import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { siteSections, type SiteSection } from '@/lib/db/schema';
import { and, eq, ilike, asc } from 'drizzle-orm';

export const metadata = {
  title: 'Our Story',
  description: 'AKSHYATA by Grain Roots Food — Rooted in nature, growing the future.',
};

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const rows = await db
    .select()
    .from(siteSections)
    .where(
      and(ilike(siteSections.key, 'about-%'), eq(siteSections.isEnabled, true))
    )
    .orderBy(asc(siteSections.sortOrder));

  const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
  const hero = byKey['about-hero'];
  const splits = rows.filter((r) => r.key !== 'about-hero');

  return (
    <>
      {hero && (
        <>
          <section className="container mx-auto px-6 py-20 md:py-28">
            <div className="max-w-3xl">
              {hero.eyebrow && <p className="eyebrow mb-4">{hero.eyebrow}</p>}
              {hero.heading && (
                <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] text-balance">
                  {hero.heading}
                </h1>
              )}
              {hero.body && (
                <p className="mt-6 text-muted-foreground leading-relaxed max-w-xl text-pretty whitespace-pre-line">
                  {hero.body}
                </p>
              )}
            </div>
          </section>

          {hero.imageUrl && (
            <section className="container mx-auto px-6 pb-20">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={hero.imageUrl}
                  alt={hero.heading || 'About'}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </section>
          )}
        </>
      )}

      {splits.map((s) => (
        <AboutSplit key={s.id} s={s} />
      ))}
    </>
  );
}

function AboutSplit({ s }: { s: SiteSection }) {
  const anchor = s.key.replace(/^about-/, '');
  return (
    <section id={anchor} className="container mx-auto px-6 py-20 border-t">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          {s.eyebrow && <p className="eyebrow mb-4">{s.eyebrow}</p>}
          {s.heading && (
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance">
              {s.heading}
            </h2>
          )}
        </div>
        <div className="text-muted-foreground leading-relaxed space-y-4">
          {s.body &&
            s.body.split(/\n\n+/).map((para, i) => (
              <p key={i} className={para.startsWith('_') && para.endsWith('_') ? 'font-serif text-foreground italic' : ''}>
                {para.replace(/^_|_$/g, '')}
              </p>
            ))}
          {s.cta1Text && s.cta1Href && (
            <p>
              <Link
                href={s.cta1Href}
                className="text-foreground underline underline-offset-4"
              >
                {s.cta1Text}
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
