import 'dotenv/config';
import { db } from './index';
import { paymentMethodConfig } from './schema';
import { eq } from 'drizzle-orm';

const METHODS = [
  {
    key: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives',
    isEnabled: true,
    sortOrder: 1,
  },
  {
    key: 'esewa',
    label: 'eSewa',
    description: 'Pay via eSewa wallet',
    isEnabled: false, // demo-phase by default
    sortOrder: 2,
  },
  {
    key: 'khalti',
    label: 'Khalti',
    description: 'Pay via Khalti wallet',
    isEnabled: false,
    sortOrder: 3,
  },
  {
    key: 'fonepay',
    label: 'Fonepay',
    description: 'Pay via Fonepay QR / mobile banking',
    isEnabled: false,
    sortOrder: 4,
  },
];

async function main() {
  for (const m of METHODS) {
    const existing = await db
      .select({ id: paymentMethodConfig.id })
      .from(paymentMethodConfig)
      .where(eq(paymentMethodConfig.key, m.key))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(paymentMethodConfig).values(m);
      console.log(`✓ inserted ${m.key}`);
    } else {
      console.log(`• ${m.key} already present, skipping`);
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
