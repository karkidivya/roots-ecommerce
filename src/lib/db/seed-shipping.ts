import 'dotenv/config';
import { db } from './index';
import { shippingZones } from './schema';
import { eq, and } from 'drizzle-orm';

// Sensible defaults for the Biratnagar / eastern-Nepal launch. Fees in paisa.
const ZONES = [
  {
    name: 'Inside Biratnagar',
    matchType: 'district' as const,
    matchValue: 'Morang',
    fee: 6000, // Rs 60
    freeAbove: 150000, // free over Rs 1500
    sortOrder: 1,
  },
  {
    name: 'Koshi Province',
    matchType: 'province' as const,
    matchValue: 'Koshi',
    fee: 10000, // Rs 100
    freeAbove: 200000, // free over Rs 2000
    sortOrder: 2,
  },
  {
    name: 'Rest of Nepal',
    matchType: 'default' as const,
    matchValue: null,
    fee: 15000, // Rs 150
    freeAbove: null,
    sortOrder: 3,
  },
];

async function main() {
  for (const z of ZONES) {
    const existing = await db
      .select({ id: shippingZones.id })
      .from(shippingZones)
      .where(
        z.matchType === 'default'
          ? eq(shippingZones.matchType, 'default')
          : and(
              eq(shippingZones.matchType, z.matchType),
              eq(shippingZones.matchValue, z.matchValue as string)
            )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(shippingZones).values(z);
      console.log(`✓ inserted zone "${z.name}"`);
    } else {
      console.log(`• zone "${z.name}" already present, skipping`);
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
