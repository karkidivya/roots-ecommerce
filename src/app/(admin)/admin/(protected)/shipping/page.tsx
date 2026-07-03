import { db } from '@/lib/db';
import { shippingZones } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/auth';
import { toPaisa, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function createZone(formData: FormData) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');

  const matchType = String(formData.get('matchType')) as 'district' | 'province' | 'default';
  const name = String(formData.get('name') || '').trim();
  const matchValue = String(formData.get('matchValue') || '').trim();
  const feeRs = Number(formData.get('fee') || 0);
  const freeAboveRs = String(formData.get('freeAbove') || '').trim();

  if (!name) return;
  if (matchType !== 'default' && !matchValue) return;

  await db.insert(shippingZones).values({
    name,
    matchType,
    matchValue: matchType === 'default' ? null : matchValue,
    fee: toPaisa(feeRs),
    freeAbove: freeAboveRs ? toPaisa(Number(freeAboveRs)) : null,
  });
  revalidatePath('/admin/shipping');
  revalidatePath('/checkout');
}

async function toggleZone(id: string, isActive: boolean) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');
  await db
    .update(shippingZones)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(shippingZones.id, id));
  revalidatePath('/admin/shipping');
  revalidatePath('/checkout');
}

async function deleteZone(id: string) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');
  await db.delete(shippingZones).where(eq(shippingZones.id, id));
  revalidatePath('/admin/shipping');
  revalidatePath('/checkout');
}

const MATCH_LABEL: Record<string, string> = {
  district: 'District',
  province: 'Province',
  default: 'Default (all other addresses)',
};

export default async function AdminShippingPage() {
  const zones = await db
    .select()
    .from(shippingZones)
    .orderBy(asc(shippingZones.sortOrder), asc(shippingZones.matchType));

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Delivery Charges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set delivery fees by district or province. At checkout the most specific
          match wins: <strong>district → province → default</strong>. Add one
          <em> Default</em> zone as a catch-all so every address gets a fee.
        </p>
      </div>

      {/* Create form */}
      <form
        action={createZone}
        className="mb-8 rounded-lg border bg-card p-5 grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <Label htmlFor="name">Zone name *</Label>
          <Input id="name" name="name" placeholder="e.g. Inside Biratnagar" required />
        </div>
        <div>
          <Label htmlFor="matchType">Match by *</Label>
          <Select id="matchType" name="matchType" defaultValue="district" required>
            <option value="district">District</option>
            <option value="province">Province</option>
            <option value="default">Default (all others)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="matchValue">District / Province name</Label>
          <Input id="matchValue" name="matchValue" placeholder="e.g. Morang" />
        </div>
        <div>
          <Label htmlFor="fee">Delivery fee (Rs) *</Label>
          <Input id="fee" name="fee" type="number" min="0" step="1" defaultValue="100" required />
        </div>
        <div>
          <Label htmlFor="freeAbove">Free delivery above (Rs, optional)</Label>
          <Input id="freeAbove" name="freeAbove" type="number" min="0" step="1" placeholder="e.g. 1500" />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Add zone</Button>
        </div>
      </form>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="p-3 text-left font-medium">Zone</th>
              <th className="p-3 text-left font-medium">Match</th>
              <th className="p-3 text-right font-medium">Fee</th>
              <th className="p-3 text-right font-medium">Free above</th>
              <th className="p-3 text-right font-medium">Status</th>
              <th className="p-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {zones.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No zones yet. Add a Default zone first.
                </td>
              </tr>
            ) : (
              zones.map((z) => (
                <tr key={z.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{z.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {MATCH_LABEL[z.matchType]}
                    {z.matchValue && `: ${z.matchValue}`}
                  </td>
                  <td className="p-3 text-right">{formatPrice(z.fee)}</td>
                  <td className="p-3 text-right text-muted-foreground">
                    {z.freeAbove != null ? formatPrice(z.freeAbove) : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <form action={toggleZone.bind(null, z.id, !z.isActive)}>
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          z.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {z.isActive ? (
                          <><Eye className="h-3 w-3" /> Active</>
                        ) : (
                          <><EyeOff className="h-3 w-3" /> Off</>
                        )}
                      </button>
                    </form>
                  </td>
                  <td className="p-3 text-right">
                    <form action={deleteZone.bind(null, z.id)}>
                      <button
                        type="submit"
                        className="text-destructive hover:text-destructive/80 p-1"
                        aria-label="Delete zone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Tip for the Biratnagar launch: add <strong>Inside Biratnagar</strong> (district: Morang,
        low fee, free above Rs 1500), a <strong>Koshi</strong> province zone, and a{' '}
        <strong>Default</strong> zone for the rest of Nepal.
      </p>
    </div>
  );
}
