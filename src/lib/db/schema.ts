import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  uuid,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'esewa',
  'khalti',
  'fonepay',
  'cod',
]);

// Categories
export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    parentId: uuid('parent_id'),
    isActive: boolean('is_active').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex('categories_slug_idx').on(t.slug),
  })
);

// Products
export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    shortDescription: text('short_description'),
    categoryId: uuid('category_id').references(() => categories.id),
    // Price in paisa (NPR * 100) to avoid float issues
    price: integer('price').notNull(),
    compareAtPrice: integer('compare_at_price'),
    sku: text('sku'),
    stock: integer('stock').default(0).notNull(),
    images: jsonb('images').$type<string[]>().default([]).notNull(),
    // For variants like size/color
    hasVariants: boolean('has_variants').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    // SEO
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex('products_slug_idx').on(t.slug),
    categoryIdx: index('products_category_idx').on(t.categoryId),
    activeIdx: index('products_active_idx').on(t.isActive),
    priceIdx: index('products_price_idx').on(t.price),
  })
);

// Product variants (size, color, etc.)
export const productVariants = pgTable(
  'product_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g., "Red - Large"
    sku: text('sku'),
    // Attributes: { color: "Red", size: "L" }
    attributes: jsonb('attributes').$type<Record<string, string>>().notNull(),
    price: integer('price'), // optional override
    stock: integer('stock').default(0).notNull(),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    productIdx: index('variants_product_idx').on(t.productId),
  })
);

// Orders
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: text('order_number').notNull(),
    // Guest checkout - no user FK needed
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email').notNull(),
    customerPhone: text('customer_phone').notNull(),
    // Nepal address fields
    shippingProvince: text('shipping_province').notNull(),
    shippingDistrict: text('shipping_district').notNull(),
    shippingMunicipality: text('shipping_municipality').notNull(),
    shippingWard: text('shipping_ward'),
    shippingAddress: text('shipping_address').notNull(),
    shippingLandmark: text('shipping_landmark'),
    // Totals (in paisa)
    subtotal: integer('subtotal').notNull(),
    shippingFee: integer('shipping_fee').default(0).notNull(),
    discount: integer('discount').default(0).notNull(),
    total: integer('total').notNull(),
    // Status
    status: orderStatusEnum('status').default('pending').notNull(),
    paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    paymentReference: text('payment_reference'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    orderNumberIdx: uniqueIndex('orders_number_idx').on(t.orderNumber),
    statusIdx: index('orders_status_idx').on(t.status),
    createdIdx: index('orders_created_idx').on(t.createdAt),
  })
);

// Order items
export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id),
    variantId: uuid('variant_id').references(() => productVariants.id),
    productName: text('product_name').notNull(), // snapshot
    variantName: text('variant_name'),
    productImage: text('product_image'),
    price: integer('price').notNull(), // snapshot in paisa
    quantity: integer('quantity').notNull(),
    subtotal: integer('subtotal').notNull(),
  },
  (t) => ({
    orderIdx: index('items_order_idx').on(t.orderId),
  })
);

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

// Site sections (editable homepage blocks)
export const siteSections = pgTable(
  'site_sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Stable identifier used to pick the renderer (hero / statement / editorial / etc.)
    key: text('key').notNull(),
    // Admin-friendly label
    name: text('name').notNull(),
    eyebrow: text('eyebrow'),
    heading: text('heading'),
    body: text('body'),
    imageUrl: text('image_url'),
    cta1Text: text('cta1_text'),
    cta1Href: text('cta1_href'),
    cta2Text: text('cta2_text'),
    cta2Href: text('cta2_href'),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    keyIdx: uniqueIndex('site_sections_key_idx').on(t.key),
  })
);

// Types
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type SiteSection = typeof siteSections.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type NewCategory = typeof categories.$inferInsert;
export type NewOrder = typeof orders.$inferInsert;
