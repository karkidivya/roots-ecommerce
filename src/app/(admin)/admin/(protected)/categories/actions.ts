'use server';

import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { isAdminAuthenticated } from '@/lib/auth';

export async function createCategory(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');

  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const imageUrl = String(formData.get('imageUrl') || '').trim();
  if (!name) return;

  await db.insert(categories).values({
    name,
    slug: slugify(name),
    description: description || null,
    imageUrl: imageUrl || null,
  });

  revalidatePath('/admin/categories');
  revalidatePath('/');
}

export async function updateCategory(id: string, formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');

  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const imageUrl = String(formData.get('imageUrl') || '').trim();
  const sortOrderRaw = String(formData.get('sortOrder') || '0');
  const isActive = formData.get('isActive') === 'on';

  if (!name) throw new Error('Name is required');

  await db
    .update(categories)
    .set({
      name,
      slug: slug ? slugify(slug) : slugify(name),
      description: description || null,
      imageUrl: imageUrl || null,
      sortOrder: Number.isFinite(Number(sortOrderRaw)) ? Number(sortOrderRaw) : 0,
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id));

  revalidatePath('/admin/categories');
  revalidatePath('/');
  redirect('/admin/categories');
}

export async function deleteCategory(id: string) {
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath('/admin/categories');
  revalidatePath('/');
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');
  await db
    .update(categories)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(categories.id, id));
  revalidatePath('/admin/categories');
  revalidatePath('/');
}
