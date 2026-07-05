import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Google Merchant Center product feed (RSS 2.0 with g: attributes).
// Submit https://<domain>/product-feed.xml in Merchant Center → it re-fetches
// daily, so products stay in sync with the admin panel automatically.

export const revalidate = 3600;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const BRAND = 'AKSHYATA';
const STORE = process.env.NEXT_PUBLIC_APP_NAME || 'Grain Roots';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const items = await db.select().from(products).where(eq(products.isActive, true));

  const entries = items
    .filter((p) => p.images?.[0]) // Merchant Center requires an image
    .map((p) => {
      const description =
        p.metaDescription || p.shortDescription || p.description?.slice(0, 5000) || p.name;
      const price = `${(p.price / 100).toFixed(2)} NPR`;
      const salePrice =
        p.compareAtPrice && p.compareAtPrice > p.price ? price : null;
      // If compareAtPrice exists it is the original; price is the sale price.
      const basePrice = salePrice
        ? `${((p.compareAtPrice as number) / 100).toFixed(2)} NPR`
        : price;

      return `  <item>
    <g:id>${esc(p.sku || p.slug)}</g:id>
    <g:title>${esc(p.name)}</g:title>
    <g:description>${esc(description)}</g:description>
    <g:link>${APP_URL}/products/${esc(p.slug)}</g:link>
    <g:image_link>${esc(p.images[0])}</g:image_link>${(p.images || [])
      .slice(1, 11)
      .map((img) => `\n    <g:additional_image_link>${esc(img)}</g:additional_image_link>`)
      .join('')}
    <g:availability>${p.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
    <g:price>${basePrice}</g:price>${salePrice ? `\n    <g:sale_price>${salePrice}</g:sale_price>` : ''}
    <g:condition>new</g:condition>
    <g:brand>${esc(BRAND)}</g:brand>
    <g:identifier_exists>no</g:identifier_exists>
  </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${esc(STORE)}</title>
  <link>${APP_URL}</link>
  <description>${esc(`${BRAND} by ${STORE} — sattu, heritage grains and millet flours, farmer-direct from Nepal.`)}</description>
${entries}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
