import 'dotenv/config';
import { db } from './index';
import { siteSections } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
  const existing = await db
    .select()
    .from(siteSections)
    .where(eq(siteSections.key, 'wholesale-cta'))
    .limit(1);

  if (existing.length > 0) {
    console.log('✓ wholesale-cta section already exists, skipping');
    process.exit(0);
  }

  await db.insert(siteSections).values({
    key: 'wholesale-cta',
    name: 'Wholesale CTA',
    eyebrow: 'Partnerships',
    heading: 'Sell our products in your store.',
    body: 'Distributors, wholesalers and retail partners — apply to join the Grain Roots family. Wholesale pricing, free delivery, and full traceability.',
    cta1Text: 'Apply now',
    cta1Href: '/wholesale',
    sortOrder: 55,
  });

  console.log('✓ wholesale-cta section inserted');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
