import 'dotenv/config';
import { db } from './index';
import { coupons } from './schema';
import { eq } from 'drizzle-orm';

// Launch offer: 10% off a customer's first order, capped at Rs 200.
const LAUNCH = {
  code: 'WELCOME10',
  description: 'First-order launch offer — 10% off',
  discountType: 'percent' as const,
  discountValue: 10,
  minSubtotal: 0,
  maxDiscount: 20000, // cap at Rs 200
  firstOrderOnly: true,
  isActive: true,
  usageLimit: null,
};

async function main() {
  const existing = await db
    .select({ id: coupons.id })
    .from(coupons)
    .where(eq(coupons.code, LAUNCH.code))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(coupons).values(LAUNCH);
    console.log(`✓ inserted coupon ${LAUNCH.code}`);
  } else {
    console.log(`• coupon ${LAUNCH.code} already present, skipping`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
