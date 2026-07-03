import 'dotenv/config';
import { db } from './index';
import { siteSections } from './schema';
import { eq } from 'drizzle-orm';

const ROWS = [
  {
    key: 'about-hero',
    name: 'About · Hero',
    eyebrow: 'Our story',
    heading: 'From a simple thought to something real, made for you.',
    body:
      'Your love and support have been truly overwhelming — and we genuinely feel it. Grain Roots Food started with one belief: real strength, energy and nutrition is already connected to our roots.',
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=85&w=2000',
    sortOrder: 10,
  },
  {
    key: 'about-why',
    name: 'About · Why AKSHYATA',
    eyebrow: 'AKSHYATA',
    heading: 'Real food. Real strength. Rooted in nature.',
    body:
      "Our grandmothers already knew it. Sattu, millets, cold-pressed oils, raw honey — this is what gave generations their energy and strength. The processed-food era made us forget.\n\nAKSHYATA is our answer. Premium sattu — Chana, Jau, Multigrain — slow-roasted and stone-ground fresh. Quick to prepare. Easy to consume. Made for busy modern mornings.\n\n_Pure. Honest. Nutritious. Real._",
    sortOrder: 20,
  },
  {
    key: 'about-sustainability',
    name: 'About · Sustainability',
    eyebrow: "The bridge we're building",
    heading: 'Traditional nutrition, modern healthy living.',
    body:
      'We pay our farmers above-market rates and commit to year-round purchases — not just during peak season. That stability is what keeps heritage varieties alive.\n\nEvery package is recyclable or compostable. No shrink wrap, no plastic clamshells, no single-use bubble wrap. Slow food, slow trade, done right.',
    sortOrder: 30,
  },
  {
    key: 'about-farmers',
    name: 'About · Reach',
    eyebrow: 'The roots are spreading 🌾',
    heading:
      'From Biratnagar to Butwal and Hetauda — and just getting started.',
    body:
      'AKSHYATA is now stocked at selected marts in Biratnagar, Butwal and Hetauda. Every store we reach, every family we feed, brings us one step closer to bringing real nutrition back to every Nepali home.',
    cta1Text: 'Apply to be a stockist →',
    cta1Href: '/wholesale',
    sortOrder: 40,
  },
];

async function main() {
  for (const r of ROWS) {
    const existing = await db
      .select({ id: siteSections.id })
      .from(siteSections)
      .where(eq(siteSections.key, r.key))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(siteSections).values(r);
      console.log(`✓ inserted ${r.key}`);
    } else {
      console.log(`• ${r.key} already present, skipping`);
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
