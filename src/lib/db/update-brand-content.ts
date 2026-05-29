import 'dotenv/config';
import { db } from './index';
import { siteSections, products, categories } from './schema';
import { eq } from 'drizzle-orm';

const SATTU_IMG =
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=85&w=1600';

const HERO_IMG =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=90&w=2400';

const EDITORIAL_IMG =
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=85&w=1600';

async function main() {
  console.log('🌾 Updating brand content...');

  // ─── Hero ─────────────────────────────────────────────────────────
  await db
    .update(siteSections)
    .set({
      name: 'Hero',
      eyebrow: 'AKSHYATA by Grain Roots',
      heading: 'Rooted in nature. Growing the future.',
      body: 'Premium sattu and heritage grains. Pure, honest nutrition for modern life.',
      imageUrl: HERO_IMG,
      cta1Text: 'Shop AKSHYATA',
      cta1Href: '/category/sattu',
      cta2Text: 'Why sattu?',
      cta2Href: '/about',
      updatedAt: new Date(),
    })
    .where(eq(siteSections.key, 'hero'));

  // ─── Statement ───────────────────────────────────────────────────
  await db
    .update(siteSections)
    .set({
      eyebrow: 'Our promise',
      heading: null,
      body:
        'The world normalized processed food. We chose to go back to the roots. AKSHYATA is real nutrition that stood the test of time — slow-roasted, stone-ground, made for the way you actually live. वास्तविक पोषण. Not just filling. Actually nourishing.',
      updatedAt: new Date(),
    })
    .where(eq(siteSections.key, 'statement'));

  // ─── Featured products ──────────────────────────────────────────
  await db
    .update(siteSections)
    .set({
      eyebrow: 'Featured',
      heading: 'Our AKSHYATA range',
      updatedAt: new Date(),
    })
    .where(eq(siteSections.key, 'featured-products'));

  // ─── Editorial (pivot to sattu story) ───────────────────────────
  await db
    .update(siteSections)
    .set({
      eyebrow: 'Field note',
      heading: 'Why are we paying for supplements when the answer is older than our grandmothers?',
      body:
        "Sattu isn't a trend. It's real nutrition that powered entire generations — plant-based protein, fiber and slow-release energy. AKSHYATA brings it back: quick to prepare, easy to consume, rooted in real nourishment. Because even in busy life, healthy choices are possible.",
      imageUrl: EDITORIAL_IMG,
      cta1Text: 'Explore the AKSHYATA range →',
      cta1Href: '/category/sattu',
      updatedAt: new Date(),
    })
    .where(eq(siteSections.key, 'editorial'));

  // ─── Categories ──────────────────────────────────────────────────
  await db
    .update(siteSections)
    .set({
      eyebrow: 'Browse',
      heading: 'Our range',
      updatedAt: new Date(),
    })
    .where(eq(siteSections.key, 'categories-grid'));

  // ─── New arrivals ───────────────────────────────────────────────
  await db
    .update(siteSections)
    .set({
      eyebrow: 'Latest',
      heading: 'New from Grain Roots',
      updatedAt: new Date(),
    })
    .where(eq(siteSections.key, 'new-arrivals'));

  // ─── Wholesale CTA ──────────────────────────────────────────────
  await db
    .update(siteSections)
    .set({
      eyebrow: 'The roots are spreading 🌾',
      heading: 'Bring AKSHYATA to your shelves.',
      body:
        "We're now in Butwal, Hetauda and Biratnagar — and we're just getting started. Distributors, retailers, cafés and corporate gifting partners welcome.",
      cta1Text: 'Become a stockist',
      cta1Href: '/wholesale',
      updatedAt: new Date(),
    })
    .where(eq(siteSections.key, 'wholesale-cta'));

  console.log('✓ Homepage sections updated');

  // ─── Rename existing Classic Natural Sattu → AKSHYATA Multigrain Sattu ──
  await db
    .update(products)
    .set({
      name: 'AKSHYATA Multigrain Sattu',
      shortDescription: 'Roasted multigrain sattu, 500g',
      description:
        'Slow-roasted barley, chickpea and millet, stone-ground fresh. Plant-based protein, fiber and slow-release energy. Mix with water, salt, lemon and cumin — or with cold milk for a healthy shake. Real food. Real strength. Rooted in nature.',
      updatedAt: new Date(),
    })
    .where(eq(products.slug, 'classic-natural-sattu'));

  // Get sattu category id
  const [sattuCat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, 'sattu'))
    .limit(1);

  if (!sattuCat) {
    console.log('⚠ No sattu category found — skipping Chana / Jau insert');
  } else {
    // ─── Chana Sattu ─────────────────────────────────────────────
    const [existingChana] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, 'akshyata-chana-sattu'))
      .limit(1);
    if (!existingChana) {
      await db.insert(products).values({
        name: 'AKSHYATA Chana Sattu',
        slug: 'akshyata-chana-sattu',
        sku: 'AK-S-CH',
        categoryId: sattuCat.id,
        shortDescription: 'Roasted chickpea sattu, 500g',
        description:
          'Pure roasted chickpea sattu — the classic. High in protein, naturally gluten-free, traditionally cooling for the gut. Mix with water + lemon + cumin for instant nourishment, or fold into roti dough for extra strength.',
        price: 45000,
        stock: 80,
        images: [SATTU_IMG],
        isFeatured: true,
        sortOrder: 2,
      });
      console.log('✓ Added AKSHYATA Chana Sattu');
    }

    // ─── Jau Sattu ─────────────────────────────────────────────
    const [existingJau] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, 'akshyata-jau-sattu'))
      .limit(1);
    if (!existingJau) {
      await db.insert(products).values({
        name: 'AKSHYATA Jau Sattu',
        slug: 'akshyata-jau-sattu',
        sku: 'AK-S-JA',
        categoryId: sattuCat.id,
        shortDescription: 'Roasted barley sattu, 500g',
        description:
          'Slow-roasted jau (barley) ground fresh. Low-GI, naturally cooling, perfect for summer mornings. The original sattu — what your grandmother grew up on. Mix into water, milk, or buttermilk.',
        price: 42000,
        stock: 80,
        images: [SATTU_IMG],
        isFeatured: true,
        sortOrder: 3,
      });
      console.log('✓ Added AKSHYATA Jau Sattu');
    }
  }

  console.log('✓ Brand content update complete');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
