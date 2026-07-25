import { db } from '@/lib/db';
import { shippingZones } from '@/lib/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/auth';
import { toPaisa, fromPaisa, formatPrice, NEPAL_PROVINCES } from '@/lib/utils';
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

async function updateZone(id: string, formData: FormData) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');

  const matchType = String(formData.get('matchType')) as 'district' | 'province' | 'default';
  const name = String(formData.get('name') || '').trim();
  const matchValue = String(formData.get('matchValue') || '').trim();
  const feeRs = Number(formData.get('fee') || 0);
  const freeAboveRs = String(formData.get('freeAbove') || '').trim();

  if (!name) return;
  if (matchType !== 'default' && !matchValue) return;

  await db
    .update(shippingZones)
    .set({
      name,
      matchType,
      matchValue: matchType === 'default' ? null : matchValue,
      fee: toPaisa(feeRs),
      freeAbove: freeAboveRs ? toPaisa(Number(freeAboveRs)) : null,
      updatedAt: new Date(),
    })
    .where(eq(shippingZones.id, id));
  revalidatePath('/admin/shipping');
  revalidatePath('/checkout');
}

// Upsert the delivery rate for a whole province. Keyed by the province name so
// the admin can manage all 7 provinces from the grid without hunting for row ids.
async function saveProvinceRate(province: string, formData: FormData) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');

  const feeRaw = String(formData.get('fee') || '').trim();
  if (feeRaw === '') return; // nothing entered — leave this province on the default
  const feeRs = Number(feeRaw);
  if (!Number.isFinite(feeRs) || feeRs < 0) return;

  const freeAboveRs = String(formData.get('freeAbove') || '').trim();
  const fee = toPaisa(feeRs);
  const freeAbove = freeAboveRs ? toPaisa(Number(freeAboveRs)) : null;

  const [existing] = await db
    .select({ id: shippingZones.id })
    .from(shippingZones)
    .where(
      and(
        eq(shippingZones.matchType, 'province'),
        sql`lower(${shippingZones.matchValue}) = ${province.toLowerCase()}`
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(shippingZones)
      .set({ fee, freeAbove, isActive: true, updatedAt: new Date() })
      .where(eq(shippingZones.id, existing.id));
  } else {
    await db.insert(shippingZones).values({
      name: `${province} Province`,
      matchType: 'province',
      matchValue: province,
      fee,
      freeAbove,
    });
  }
  revalidatePath('/admin/shipping');
  revalidatePath('/checkout');
}

// Remove a province's specific rate → orders there fall back to the default zone.
async function removeProvinceRate(province: string) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');
  await db
    .delete(shippingZones)
    .where(
      and(
        eq(shippingZones.matchType, 'province'),
        sql`lower(${shippingZones.matchValue}) = ${province.toLowerCase()}`
      )
    );
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

  // Province rates are managed in their own grid; everything else (district
  // rules + the default catch-all) lives in the zones list below.
  const provinceByName = new Map(
    zones
      .filter((z) => z.matchType === 'province')
      .map((z) => [(z.matchValue || '').toLowerCase(), z])
  );
  const otherZones = zones.filter((z) => z.matchType !== 'province');

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Delivery Charges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          At checkout the most specific match wins:{' '}
          <strong>district → province → default</strong>. Set a per-province rate
          below, add district-specific rules for cities you deliver cheaply to, and
          keep one <em>Default</em> zone as the catch-all for everywhere else.
        </p>
      </div>

      {/* ── Province rates (all 7) ─────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold">Province delivery rates</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Set the delivery fee for each of Nepal&apos;s 7 provinces. Leave a
          province blank to charge it the <strong>Default</strong> rate instead.
          Enter <code>0</code> for free delivery to that province.
        </p>

        <div className="rounded-lg border bg-card divide-y">
          {/* Header (desktop) */}
          <div className="hidden sm:grid grid-cols-[1.3fr_1fr_1fr_auto] gap-3 px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Province</span>
            <span>Delivery fee (Rs)</span>
            <span>Free above (Rs)</span>
            <span className="text-right">Actions</span>
          </div>

          {NEPAL_PROVINCES.map((province) => {
            const z = provinceByName.get(province.toLowerCase());
            return (
              <form
                key={province}
                action={saveProvinceRate.bind(null, province)}
                className="grid gap-3 px-4 py-4 sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:items-end"
              >
                <div>
                  <span className="font-medium">{province}</span>
                  <span
                    className={`ml-2 text-xs ${
                      z
                        ? z.isActive
                          ? 'text-green-700'
                          : 'text-muted-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {z ? (z.isActive ? 'Active' : 'Inactive') : 'Uses default'}
                  </span>
                </div>
                <div>
                  <Label htmlFor={`fee-${province}`} className="sm:hidden text-xs">
                    Delivery fee (Rs)
                  </Label>
                  <Input
                    id={`fee-${province}`}
                    name="fee"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="default"
                    defaultValue={z ? fromPaisa(z.fee) : ''}
                  />
                </div>
                <div>
                  <Label htmlFor={`free-${province}`} className="sm:hidden text-xs">
                    Free above (Rs)
                  </Label>
                  <Input
                    id={`free-${province}`}
                    name="freeAbove"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="never"
                    defaultValue={z?.freeAbove != null ? fromPaisa(z.freeAbove) : ''}
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                  {z && (
                    <button
                      type="submit"
                      formAction={removeProvinceRate.bind(null, province)}
                      formNoValidate
                      className="text-destructive hover:text-destructive/80 p-1.5"
                      aria-label={`Remove ${province} rate`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            );
          })}
        </div>
      </section>

      {/* ── District & default zones ───────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold">District &amp; default zones</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          District rates override province rates (e.g. a cheaper fee inside your
          home city). The <strong>Default</strong> zone applies to any address not
          matched above — keep exactly one.
        </p>

        <div className="rounded-lg border bg-card divide-y">
          {/* Header (desktop) */}
          <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_0.9fr_0.9fr_auto] gap-3 px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Zone name</span>
            <span>Match by</span>
            <span>District / Province</span>
            <span>Fee (Rs)</span>
            <span>Free above (Rs)</span>
            <span className="text-right">Actions</span>
          </div>

          {otherZones.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No district or default zones yet. Add a Default zone below.
            </p>
          ) : (
            otherZones.map((z) => (
              <form
                key={z.id}
                action={updateZone.bind(null, z.id)}
                className="grid gap-3 px-4 py-4 md:grid-cols-[1.4fr_1fr_1fr_0.9fr_0.9fr_auto] md:items-end"
              >
                <div>
                  <Label htmlFor={`name-${z.id}`} className="md:hidden text-xs">
                    Zone name
                  </Label>
                  <Input id={`name-${z.id}`} name="name" defaultValue={z.name} required />
                </div>
                <div>
                  <Label htmlFor={`type-${z.id}`} className="md:hidden text-xs">
                    Match by
                  </Label>
                  <Select id={`type-${z.id}`} name="matchType" defaultValue={z.matchType}>
                    <option value="district">District</option>
                    <option value="province">Province</option>
                    <option value="default">Default</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`val-${z.id}`} className="md:hidden text-xs">
                    District / Province
                  </Label>
                  <Input
                    id={`val-${z.id}`}
                    name="matchValue"
                    defaultValue={z.matchValue ?? ''}
                    placeholder={z.matchType === 'default' ? '— (all others)' : 'e.g. Morang'}
                  />
                </div>
                <div>
                  <Label htmlFor={`fee-z-${z.id}`} className="md:hidden text-xs">
                    Fee (Rs)
                  </Label>
                  <Input
                    id={`fee-z-${z.id}`}
                    name="fee"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={fromPaisa(z.fee)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`free-z-${z.id}`} className="md:hidden text-xs">
                    Free above (Rs)
                  </Label>
                  <Input
                    id={`free-z-${z.id}`}
                    name="freeAbove"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="never"
                    defaultValue={z.freeAbove != null ? fromPaisa(z.freeAbove) : ''}
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                  <button
                    type="submit"
                    formAction={toggleZone.bind(null, z.id, !z.isActive)}
                    formNoValidate
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      z.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                    aria-label={z.isActive ? 'Deactivate zone' : 'Activate zone'}
                  >
                    {z.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>
                  <button
                    type="submit"
                    formAction={deleteZone.bind(null, z.id)}
                    formNoValidate
                    className="text-destructive hover:text-destructive/80 p-1.5"
                    aria-label="Delete zone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ))
          )}
        </div>

        {/* Add a new district / default zone */}
        <form
          action={createZone}
          className="mt-6 rounded-lg border bg-card p-5 grid gap-4 sm:grid-cols-2"
        >
          <h3 className="sm:col-span-2 font-medium">Add a district or default zone</h3>
          <div className="sm:col-span-2">
            <Label htmlFor="name">Zone name *</Label>
            <Input id="name" name="name" placeholder="e.g. Inside Biratnagar" required />
          </div>
          <div>
            <Label htmlFor="matchType">Match by *</Label>
            <Select id="matchType" name="matchType" defaultValue="district" required>
              <option value="district">District</option>
              <option value="default">Default (all others)</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="matchValue">District name</Label>
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
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        Current live rates:{' '}
        {zones.filter((z) => z.isActive).length === 0
          ? 'none active'
          : zones
              .filter((z) => z.isActive)
              .map((z) => `${z.name} ${formatPrice(z.fee)}`)
              .join(' · ')}
      </p>
    </div>
  );
}
