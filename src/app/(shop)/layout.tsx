import { db } from '@/lib/db';
import { categories as categoriesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Header } from '@/components/shop/header';
import { Footer } from '@/components/shop/footer';
import { CartDrawer } from '@/components/shop/cart-drawer';
import { WhatsAppWidget } from '@/components/shop/whatsapp-widget';

export const revalidate = 3600; // 1 hour

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const cats = await db
    .select({
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      imageUrl: categoriesTable.imageUrl,
      description: categoriesTable.description,
    })
    .from(categoriesTable)
    .where(eq(categoriesTable.isActive, true))
    .orderBy(categoriesTable.sortOrder);

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={cats} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppWidget />
    </div>
  );
}
