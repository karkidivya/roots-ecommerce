import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { SiteSection } from '@/lib/db/schema';

export function HeroSection({ s }: { s: SiteSection }) {
  return (
    <section className="relative">
      <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
        {s.imageUrl && (
          <Image
            src={s.imageUrl}
            alt={s.heading || ''}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-transparent to-foreground/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-20 md:pb-28">
            {s.eyebrow && (
              <p className="text-[11px] uppercase tracking-[0.3em] text-background/90">
                {s.eyebrow}
              </p>
            )}
            {s.heading && (
              <h1 className="mt-5 font-serif text-5xl md:text-7xl text-background max-w-2xl leading-[1.02] text-balance">
                {s.heading}
              </h1>
            )}
            {(s.cta1Text || s.cta2Text) && (
              <div className="mt-10 flex items-center gap-3">
                {s.cta1Text && s.cta1Href && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-background text-foreground hover:bg-background/90"
                  >
                    <Link href={s.cta1Href}>{s.cta1Text}</Link>
                  </Button>
                )}
                {s.cta2Text && s.cta2Href && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-background/80 text-background hover:bg-background hover:text-foreground"
                  >
                    <Link href={s.cta2Href}>{s.cta2Text}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function StatementSection({ s }: { s: SiteSection }) {
  return (
    <section className="container mx-auto px-6 py-28 md:py-36">
      <div className="max-w-3xl mx-auto text-center">
        {s.eyebrow && <p className="eyebrow mb-6">{s.eyebrow}</p>}
        {s.body && (
          <p className="font-serif text-2xl md:text-[34px] leading-[1.35] text-balance">
            {s.body}
          </p>
        )}
      </div>
    </section>
  );
}

export function EditorialSection({ s }: { s: SiteSection }) {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[5/6] overflow-hidden">
          {s.imageUrl && (
            <Image
              src={s.imageUrl}
              alt={s.heading || ''}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="lg:pl-16">
          {s.eyebrow && <p className="eyebrow mb-5">{s.eyebrow}</p>}
          {s.heading && (
            <h2 className="font-serif text-3xl md:text-5xl leading-[1.1] text-balance">
              {s.heading}
            </h2>
          )}
          {s.body && (
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
              {s.body}
            </p>
          )}
          {s.cta1Text && s.cta1Href && (
            <div className="mt-8">
              <Link
                href={s.cta1Href}
                className="inline-block text-sm border-b border-foreground/60 pb-0.5 hover:border-foreground transition-colors"
              >
                {s.cta1Text}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ s, viewAllHref }: { s: SiteSection; viewAllHref?: string }) {
  return (
    <div className="flex items-end justify-between mb-10">
      <div>
        {s.eyebrow && <p className="eyebrow mb-2">{s.eyebrow}</p>}
        <h2 className="font-serif text-3xl md:text-4xl">{s.heading}</h2>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm hover:text-muted-foreground transition-colors"
        >
          See all
        </Link>
      )}
    </div>
  );
}
