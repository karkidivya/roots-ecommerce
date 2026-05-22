'use server';

import { db } from '@/lib/db';
import { siteSections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');
}

export async function updateSection(id: string, formData: FormData) {
  await requireAdmin();

  await db
    .update(siteSections)
    .set({
      eyebrow: str(formData.get('eyebrow')) || null,
      heading: str(formData.get('heading')) || null,
      body: str(formData.get('body')) || null,
      imageUrl: str(formData.get('imageUrl')) || null,
      cta1Text: str(formData.get('cta1Text')) || null,
      cta1Href: str(formData.get('cta1Href')) || null,
      cta2Text: str(formData.get('cta2Text')) || null,
      cta2Href: str(formData.get('cta2Href')) || null,
      isEnabled: formData.get('isEnabled') === 'on',
      sortOrder: Number(formData.get('sortOrder') || 0),
      updatedAt: new Date(),
    })
    .where(eq(siteSections.id, id));

  revalidatePath('/admin/sections');
  revalidatePath('/');
  redirect('/admin/sections');
}

export async function toggleSection(id: string, isEnabled: boolean) {
  await requireAdmin();
  await db
    .update(siteSections)
    .set({ isEnabled, updatedAt: new Date() })
    .where(eq(siteSections.id, id));
  revalidatePath('/admin/sections');
  revalidatePath('/');
}

function str(v: FormDataEntryValue | null): string {
  return String(v ?? '').trim();
}
