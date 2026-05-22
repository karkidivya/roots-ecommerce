'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { products as productsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { slugify, toPaisa } from '@/lib/utils';
import { isAdminAuthenticated } from '@/lib/auth';

const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  price: z.coerce.number().positive(), // rupees from form
  compareAtPrice: z.coerce.number().optional(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  images: z.string().optional(), // comma-separated URLs
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error('Unauthorized');
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const raw = {
    name: String(formData.get('name') || ''),
    slug: String(formData.get('slug') || ''),
    description: String(formData.get('description') || ''),
    shortDescription: String(formData.get('shortDescription') || ''),
    categoryId: String(formData.get('categoryId') || ''),
    price: formData.get('price'),
    compareAtPrice: formData.get('compareAtPrice') || undefined,
    sku: String(formData.get('sku') || ''),
    stock: formData.get('stock'),
    images: String(formData.get('images') || ''),
    isActive: formData.get('isActive') === 'on',
    isFeatured: formData.get('isFeatured') === 'on',
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('Invalid input: ' + parsed.error.issues[0].message);
  }

  const d = parsed.data;
  const slug = d.slug?.trim() ? slugify(d.slug) : slugify(d.name);
  const imageUrls = d.images
    ? d.images.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  await db.insert(productsTable).values({
    name: d.name,
    slug,
    description: d.description || null,
    shortDescription: d.shortDescription || null,
    categoryId: d.categoryId || null,
    price: toPaisa(d.price),
    compareAtPrice: d.compareAtPrice ? toPaisa(d.compareAtPrice) : null,
    sku: d.sku || null,
    stock: d.stock,
    images: imageUrls,
    isActive: d.isActive ?? true,
    isFeatured: d.isFeatured ?? false,
  });

  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath('/');
  redirect('/admin/products');
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    name: String(formData.get('name') || ''),
    slug: String(formData.get('slug') || ''),
    description: String(formData.get('description') || ''),
    shortDescription: String(formData.get('shortDescription') || ''),
    categoryId: String(formData.get('categoryId') || ''),
    price: formData.get('price'),
    compareAtPrice: formData.get('compareAtPrice') || undefined,
    sku: String(formData.get('sku') || ''),
    stock: formData.get('stock'),
    images: String(formData.get('images') || ''),
    isActive: formData.get('isActive') === 'on',
    isFeatured: formData.get('isFeatured') === 'on',
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('Invalid input: ' + parsed.error.issues[0].message);
  }

  const d = parsed.data;
  const slug = d.slug?.trim() ? slugify(d.slug) : slugify(d.name);
  const imageUrls = d.images
    ? d.images.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  await db
    .update(productsTable)
    .set({
      name: d.name,
      slug,
      description: d.description || null,
      shortDescription: d.shortDescription || null,
      categoryId: d.categoryId || null,
      price: toPaisa(d.price),
      compareAtPrice: d.compareAtPrice ? toPaisa(d.compareAtPrice) : null,
      sku: d.sku || null,
      stock: d.stock,
      images: imageUrls,
      isActive: d.isActive ?? true,
      isFeatured: d.isFeatured ?? false,
      updatedAt: new Date(),
    })
    .where(eq(productsTable.id, id));

  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath(`/products/${slug}`);
  revalidatePath('/');
  redirect('/admin/products');
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.delete(productsTable).where(eq(productsTable.id, id));
  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath('/');
}
