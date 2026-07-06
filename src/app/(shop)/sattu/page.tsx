import Link from 'next/link';
import { db } from '@/lib/db';
import { products as productsTable, categories as categoriesTable } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { ProductCard } from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const revalidate = 3600;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Sattu (सातु) — Benefits, How to Make Sattu Sharbat & Where to Buy in Nepal',
  description:
    'Everything about sattu (सातु): health benefits, protein content, how to make sattu sharbat, chana vs jau vs multigrain — and where to buy fresh stone-ground sattu online in Biratnagar & all Nepal. Cash on delivery.',
  alternates: { canonical: `${APP_URL}/sattu` },
};

const FAQS = [
  {
    q: 'What is sattu (सातु)?',
    a: 'Sattu is a traditional flour made by dry-roasting grains and pulses — most commonly chana (Bengal gram), jau (barley) or a multigrain mix — then stone-grinding them into a fine, ready-to-eat powder. It has been a staple source of energy and protein in the Terai and across Nepal for generations.',
  },
  {
    q: 'What are the health benefits of sattu?',
    a: 'Sattu is high in plant protein and fibre, has a low glycemic index, and is naturally cooling — which is why sattu sharbat is a popular summer drink. It supports digestion, keeps you full for hours, and provides steady energy without processed sugar. Chana sattu contains roughly 20g of protein per 100g.',
  },
  {
    q: 'How do you make sattu sharbat?',
    a: 'Mix 2–3 tablespoons of sattu in a glass of cold water. For the salty version add lemon juice, roasted cumin, black salt and chopped onion; for the sweet version add jaggery or sugar. Stir well and drink fresh — it takes under 2 minutes.',
  },
  {
    q: 'Is sattu better than protein powder?',
    a: 'Sattu is a whole-food protein source with no additives, sweeteners or preservatives — at a fraction of the price of imported protein supplements. While whey protein is more concentrated, sattu provides protein along with fibre, minerals and slow-release carbs, making it a natural everyday option for most people.',
  },
  {
    q: 'What is the price of sattu in Nepal?',
    a: 'Fresh stone-ground sattu in Nepal typically costs Rs 150–400 per 500g depending on the grain. AKSHYATA sattu is slow-roasted and stone-ground in small batches — check current prices on our sattu collection page.',
  },
  {
    q: 'Where can I buy sattu in Biratnagar?',
    a: 'AKSHYATA sattu is made in Biratnagar and stocked at selected marts across the city. You can also order online at grainroots.com.np with home delivery in Biratnagar (often same-day) and across Nepal — cash on delivery available.',
  },
];

export default async function SattuGuidePage() {
  const [category] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, 'sattu'))
    .limit(1);

  const items = category
    ? await db
        .select()
        .from(productsTable)
        .where(
          and(eq(productsTable.categoryId, category.id), eq(productsTable.isActive, true))
        )
    : [];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Sattu (सातु): Benefits, Recipes & Where to Buy in Nepal',
      author: { '@type': 'Organization', name: 'Grain Roots Food' },
      publisher: { '@type': 'Organization', name: 'Grain Roots Food' },
      mainEntityOfPage: `${APP_URL}/sattu`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="eyebrow mb-4">The complete guide</p>
      <h1 className="font-serif text-3xl sm:text-5xl leading-tight text-balance">
        Sattu (सातु) — Nepal&apos;s original superfood
      </h1>
      <p className="mt-5 text-muted-foreground leading-relaxed max-w-2xl">
        Long before protein powders, our grandmothers already had the answer. Sattu —
        grains and pulses slow-roasted and stone-ground into a fine, ready-to-eat flour —
        has powered farmers, students and athletes across the Terai for generations.
        High in plant protein, naturally cooling, and ready in two minutes.
      </p>

      {/* Quick facts */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          ['~20g', 'protein per 100g (chana)'],
          ['0', 'additives or preservatives'],
          ['2 min', 'to prepare'],
          ['100%', 'roasted & stone-ground'],
        ].map(([big, small]) => (
          <div key={small} className="rounded-sm border p-4">
            <p className="font-serif text-2xl">{big}</p>
            <p className="mt-1 text-xs text-muted-foreground">{small}</p>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl sm:text-3xl mb-4">Why sattu?</h2>
        <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
          <li>
            <strong className="text-foreground">Natural protein.</strong> Chana sattu
            delivers around 20g of protein per 100g — comparable to many supplements, from
            food your body recognises.
          </li>
          <li>
            <strong className="text-foreground">Cooling in summer.</strong> Sattu sharbat
            (सातुको सर्बत) is the Terai&apos;s traditional answer to the heat — it hydrates
            and keeps energy steady through the day.
          </li>
          <li>
            <strong className="text-foreground">Good for digestion.</strong> High fibre
            and a low glycemic index mean slow, steady energy — no sugar crash.
          </li>
          <li>
            <strong className="text-foreground">Honest food.</strong> One ingredient,
            roasted and ground. Nothing added, nothing removed.
          </li>
        </ul>
      </section>

      {/* Recipe */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl sm:text-3xl mb-4">
          How to make sattu sharbat (2 minutes)
        </h2>
        <ol className="space-y-2 text-sm text-muted-foreground leading-relaxed list-decimal pl-5">
          <li>Add 2–3 tablespoons of sattu to a glass of cold water</li>
          <li>
            <strong className="text-foreground">Salty:</strong> lemon juice + roasted cumin
            + black salt (+ chopped onion if you like it the Terai way)
          </li>
          <li>
            <strong className="text-foreground">Sweet:</strong> jaggery or sugar
          </li>
          <li>Stir well, drink fresh</li>
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          Also try it as <em>litti</em> filling, kneaded into dough for sattu paratha, or a
          quick porridge with warm milk for breakfast.
        </p>
      </section>

      {/* Products */}
      {items.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl sm:text-3xl mb-2">Shop AKSHYATA sattu</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Slow-roasted and stone-ground fresh in Biratnagar. Home delivery across Nepal —
            cash on delivery available.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
            {items.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/category/sattu">See the full sattu range</Link>
            </Button>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl sm:text-3xl mb-6">Frequently asked questions</h2>
        <div className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.q} className="border-b pb-5">
              <h3 className="font-medium mb-2">{f.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
