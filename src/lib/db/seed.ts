import 'dotenv/config';
import { db } from './index';
import {
  categories,
  products,
  orderItems,
  orders,
  productVariants,
  siteSections,
} from './schema';

// High-quality Unsplash photography. `auto=format` serves AVIF/WebP,
// `q=85` is near-lossless, `fit=crop` ensures clean aspect ratios.
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=85&w=${w}`;

const IMG = {
  // Sattu / flour
  sattuBowl: u('photo-1586201375761-83865001e31c'),
  sattuShake: u('photo-1559598467-f8b76c8155d0'),
  giftBox: u('photo-1607344645866-009c320b63e0'),

  // Grains & rice
  redRice: u('photo-1586201375761-83865001e31c'),
  flourBowl: u('photo-1574323347407-f5e1ad6d020b'),
  millet: u('photo-1574323347407-f5e1ad6d020b'),

  // Honey
  honeyJar: u('photo-1587049352846-4a222e784d38'),
  honeyComb: u('photo-1471943311424-646960669fbc'),

  // Tea
  blackTea: u('photo-1597481499750-3e6b22637e12'),
  herbalTea: u('photo-1564890369478-c89ca6d9cde9'),

  // Hero / category covers (larger)
  hero: u('photo-1500382017468-9049fed747ef', 2400),
  catSattu: u('photo-1574323347407-f5e1ad6d020b', 1600),
  catGrains: u('photo-1586201375761-83865001e31c', 1600),
  catHoney: u('photo-1587049352846-4a222e784d38', 1600),
  catTea: u('photo-1576092768241-dec231879fc3', 1600),
};

async function seed() {
  console.log('🌱 Seeding database...');

  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(productVariants);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(siteSections);

  const [catSattu, catGrains, catHoney, catTea] = await db
    .insert(categories)
    .values([
      {
        name: 'Sattu',
        slug: 'sattu',
        description: 'Roasted multigrain sattu — our flagship range',
        imageUrl: IMG.catSattu,
        sortOrder: 1,
      },
      {
        name: 'Grains & Flours',
        slug: 'grains-flours',
        description: 'Heritage grains and stone-ground flours',
        imageUrl: IMG.catGrains,
        sortOrder: 2,
      },
      {
        name: 'Honey',
        slug: 'honey',
        description: 'Raw, unfiltered Himalayan honey',
        imageUrl: IMG.catHoney,
        sortOrder: 3,
      },
      {
        name: 'Tea & Herbs',
        slug: 'tea-herbs',
        description: 'Ilam orthodox teas and herbal infusions',
        imageUrl: IMG.catTea,
        sortOrder: 4,
      },
    ])
    .returning();

  await db.insert(products).values([
    {
      name: 'Classic Natural Sattu',
      slug: 'classic-natural-sattu',
      sku: 'GR-L01',
      categoryId: catSattu.id,
      shortDescription: 'Roasted multigrain sattu, 500g',
      description:
        'Our signature sattu — slow-roasted barley, chickpea and millet, stone-ground fresh. Mix with water, salt, lemon and cumin for instant nourishment.',
      price: 45000,
      stock: 100,
      images: [IMG.sattuBowl, IMG.sattuShake],
      isFeatured: true,
    },
    {
      name: 'Sattu Festival Gift Box',
      slug: 'sattu-festival-gift-box',
      sku: 'GR-L05',
      categoryId: catSattu.id,
      shortDescription: 'All four sattu flavors in a gift box',
      description:
        'Hand-packed Tihar/Dashain gift box: Classic, Dark Chocolate, Cardamom Honey, and Sachet pack. Includes a wooden spoon and brochure.',
      price: 185000,
      compareAtPrice: 220000,
      stock: 25,
      images: [IMG.giftBox],
      isFeatured: true,
    },
    {
      name: 'Marsi Red Rice (Jumla)',
      slug: 'marsi-red-rice-jumla',
      sku: 'GR-B01',
      categoryId: catGrains.id,
      shortDescription: 'Heritage red rice from Jumla, 1kg',
      description:
        'Indigenous Marsi rice grown at 2,500m in Jumla. Earthy aroma, mineral-rich, never hybridised.',
      price: 68000,
      stock: 30,
      images: [IMG.redRice],
      isFeatured: true,
    },
    {
      name: 'Finger Millet Flour (Kodo Pitho)',
      slug: 'finger-millet-flour-kodo',
      sku: 'GR-A09',
      categoryId: catGrains.id,
      shortDescription: 'Stone-ground kodo flour, 1kg',
      description:
        'Traditional kodo pitho ground fresh. The base for authentic Nepali dhindo and ragi roti.',
      price: 34000,
      stock: 55,
      images: [IMG.flourBowl, IMG.millet],
    },
    {
      name: 'Wild Cliff Honey (Taplejung)',
      slug: 'wild-cliff-honey-taplejung',
      sku: 'GR-G01',
      categoryId: catHoney.id,
      shortDescription: 'Hand-harvested wild cliff honey, 500g',
      description:
        'Rare Himalayan cliff honey from Apis laboriosa, harvested by Gurung honey-hunters in Taplejung. Floral, dark, and subtly psychoactive.',
      price: 280000,
      stock: 15,
      images: [IMG.honeyComb, IMG.honeyJar],
      isFeatured: true,
    },
    {
      name: 'Raw Honey',
      slug: 'raw-honey-nepal',
      sku: 'GR-G02',
      categoryId: catHoney.id,
      shortDescription: 'Unheated, unfiltered raw honey, 500g',
      description:
        'Single-apiary raw honey from the mid-hills. Never pasteurised — enzymes and pollen intact.',
      price: 115000,
      stock: 50,
      images: [
        'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=1600&auto=format&fit=crop&q=85&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGhvbmV5fGVufDB8fDB8fHww',
      ],
    },
    {
      name: 'Ilam First Flush Black Tea',
      slug: 'ilam-first-flush-black-tea',
      sku: 'GR-H01',
      categoryId: catTea.id,
      shortDescription: 'Orthodox Ilam first flush, 100g',
      description:
        'Hand-rolled spring leaves from Ilam estates. Bright, muscatel, gentle astringency. Steep 3 min in 90°C water.',
      price: 85000,
      stock: 40,
      images: [IMG.blackTea],
      isFeatured: true,
    },
    {
      name: 'Tulsi Tea',
      slug: 'tulsi-tea',
      sku: 'GR-H03',
      categoryId: catTea.id,
      shortDescription: 'Holy basil leaf tea, 50g',
      description:
        'Whole-leaf tulsi sun-dried at low heat. Calming, adaptogenic, and traditionally taken for immunity.',
      price: 38000,
      stock: 60,
      images: [IMG.herbalTea],
    },
  ]);

  // Site sections — the editable homepage blocks
  await db.insert(siteSections).values([
    {
      key: 'hero',
      name: 'Hero',
      eyebrow: 'Est. in the Himalayas',
      heading: 'Food, the way it was grown.',
      imageUrl: u('photo-1500382017468-9049fed747ef', 2400),
      cta1Text: 'Shop the collection',
      cta1Href: '/products',
      cta2Text: 'The Sattu range',
      cta2Href: '/category/sattu',
      sortOrder: 10,
    },
    {
      key: 'statement',
      name: 'Statement',
      eyebrow: 'Our principle',
      body: 'We work with smallholder farmers across Karnali, Mustang and Ilam — preserving heritage varieties and keeping every step honest. What lands in your kitchen is exactly what came off the field.',
      sortOrder: 20,
    },
    {
      key: 'featured-products',
      name: 'Featured products',
      heading: 'Featured this season',
      sortOrder: 30,
    },
    {
      key: 'editorial',
      name: 'Editorial story',
      eyebrow: 'Field note',
      heading: 'Wild cliff honey, harvested by hand.',
      body: "For three days a year, Gurung honey-hunters in Taplejung scale 200-meter cliffs to gather the rare nectar of Apis laboriosa — the world's largest honey bee. The result is a deep, floral honey unlike anything else on earth.",
      imageUrl: u('photo-1587049352846-4a222e784d38', 1600),
      cta1Text: 'Explore the honey collection',
      cta1Href: '/category/honey',
      sortOrder: 40,
    },
    {
      key: 'categories-grid',
      name: 'Categories',
      heading: 'Categories',
      sortOrder: 50,
    },
    {
      key: 'wholesale-cta',
      name: 'Wholesale CTA',
      eyebrow: 'Partnerships',
      heading: 'Sell our products in your store.',
      body: 'Distributors, wholesalers and retail partners — apply to join the Grain Roots family. Wholesale pricing, free delivery, and full traceability.',
      cta1Text: 'Apply now',
      cta1Href: '/wholesale',
      sortOrder: 55,
    },
    {
      key: 'new-arrivals',
      name: 'New arrivals',
      heading: 'New arrivals',
      sortOrder: 60,
    },
  ]);

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
