import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/auth';
import { toPaisa, formatPrice } from '@/lib/utils';
import { normalizeCode } from '@/lib/coupons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function createCoupon(formData: FormData) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');

  const code = normalizeCode(String(formData.get('code') || ''));
  if (!code) return;

  const discountType = String(formData.get('discountType')) as 'percent' | 'fixed';
  const rawValue = Number(formData.get('discountValue') || 0);
  const discountValue = discountType === 'percent' ? Math.round(rawValue) : toPaisa(rawValue);

  const minRs = Number(formData.get('minSubtotal') || 0);
  const maxRs = String(formData.get('maxDiscount') || '').trim();
  const usageLimit = String(formData.get('usageLimit') || '').trim();
  const expiresAt = String(formData.get('expiresAt') || '').trim();

  await db
    .insert(coupons)
    .values({
      code,
      description: String(formData.get('description') || '').trim() || null,
      discountType,
      discountValue,
      minSubtotal: toPaisa(minRs),
      maxDiscount: maxRs ? toPaisa(Number(maxRs)) : null,
      firstOrderOnly: formData.get('firstOrderOnly') === 'on',
      usageLimit: usageLimit ? Number(usageLimit) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .onConflictDoNothing();
  revalidatePath('/admin/coupons');
}

async function toggleCoupon(id: string, isActive: boolean) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');
  await db
    .update(coupons)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(coupons.id, id));
  revalidatePath('/admin/coupons');
}

async function deleteCoupon(id: string) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath('/admin/coupons');
}

export default async function AdminCouponsPage() {
  const all = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create discount codes for customers to enter at checkout. Tick{' '}
          <strong>First order only</strong> to reward new customers — it&apos;s validated
          against the phone number, so a phone that has ordered before can&apos;t reuse it.
        </p>
      </div>

      {/* Create form */}
      <form
        action={createCoupon}
        className="mb-8 rounded-lg border bg-card p-5 grid gap-4 sm:grid-cols-2"
      >
        <div>
          <Label htmlFor="code">Code *</Label>
          <Input id="code" name="code" placeholder="WELCOME10" required className="uppercase" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="First-order launch offer" />
        </div>
        <div>
          <Label htmlFor="discountType">Discount type *</Label>
          <Select id="discountType" name="discountType" defaultValue="percent" required>
            <option value="percent">Percent (%)</option>
            <option value="fixed">Fixed amount (Rs)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="discountValue">Value * (% or Rs)</Label>
          <Input id="discountValue" name="discountValue" type="number" min="1" step="1" defaultValue="10" required />
        </div>
        <div>
          <Label htmlFor="minSubtotal">Min. order (Rs)</Label>
          <Input id="minSubtotal" name="minSubtotal" type="number" min="0" step="1" defaultValue="0" />
        </div>
        <div>
          <Label htmlFor="maxDiscount">Max. discount (Rs, for %)</Label>
          <Input id="maxDiscount" name="maxDiscount" type="number" min="0" step="1" placeholder="e.g. 200" />
        </div>
        <div>
          <Label htmlFor="usageLimit">Usage limit (total)</Label>
          <Input id="usageLimit" name="usageLimit" type="number" min="1" step="1" placeholder="unlimited" />
        </div>
        <div>
          <Label htmlFor="expiresAt">Expires on</Label>
          <Input id="expiresAt" name="expiresAt" type="date" />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input id="firstOrderOnly" name="firstOrderOnly" type="checkbox" defaultChecked className="h-4 w-4" />
          <Label htmlFor="firstOrderOnly" className="!mb-0">First order only (new customers)</Label>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Create coupon</Button>
        </div>
      </form>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="p-3 text-left font-medium">Code</th>
              <th className="p-3 text-left font-medium">Discount</th>
              <th className="p-3 text-left font-medium">Rules</th>
              <th className="p-3 text-right font-medium">Used</th>
              <th className="p-3 text-right font-medium">Status</th>
              <th className="p-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {all.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              all.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                return (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="p-3">
                      <p className="font-mono font-semibold">{c.code}</p>
                      {c.description && (
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      )}
                    </td>
                    <td className="p-3">
                      {c.discountType === 'percent'
                        ? `${c.discountValue}%`
                        : formatPrice(c.discountValue)}
                      {c.maxDiscount != null && (
                        <span className="text-xs text-muted-foreground"> (max {formatPrice(c.maxDiscount)})</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground space-y-0.5">
                      {c.firstOrderOnly && <div>First order only</div>}
                      {c.minSubtotal > 0 && <div>Min {formatPrice(c.minSubtotal)}</div>}
                      {c.usageLimit != null && <div>Limit {c.usageLimit}</div>}
                      {c.expiresAt && (
                        <div className={expired ? 'text-destructive' : ''}>
                          {expired ? 'Expired ' : 'Until '}
                          {new Date(c.expiresAt).toLocaleDateString('en-NP')}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">{c.usedCount}</td>
                    <td className="p-3 text-right">
                      <form action={toggleCoupon.bind(null, c.id, !c.isActive)}>
                        <button
                          type="submit"
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            c.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {c.isActive ? (
                            <><Eye className="h-3 w-3" /> Active</>
                          ) : (
                            <><EyeOff className="h-3 w-3" /> Off</>
                          )}
                        </button>
                      </form>
                    </td>
                    <td className="p-3 text-right">
                      <form action={deleteCoupon.bind(null, c.id)}>
                        <button
                          type="submit"
                          className="text-destructive hover:text-destructive/80 p-1"
                          aria-label="Delete coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
