import { db } from '@/lib/db';
import { paymentMethodConfig } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/auth';
import { Eye, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function toggle(id: string, isEnabled: boolean) {
  'use server';
  if (!(await isAdminAuthenticated())) throw new Error('Unauthorized');
  await db
    .update(paymentMethodConfig)
    .set({ isEnabled, updatedAt: new Date() })
    .where(eq(paymentMethodConfig.id, id));
  revalidatePath('/admin/payment-methods');
  revalidatePath('/checkout');
}

export default async function AdminPaymentMethodsPage() {
  const methods = await db
    .select()
    .from(paymentMethodConfig)
    .orderBy(asc(paymentMethodConfig.sortOrder));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle which payment options customers see at checkout. Useful during the
          demo phase — keep COD on while gateways are being verified.
        </p>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="p-3 text-left font-medium w-12">#</th>
              <th className="p-3 text-left font-medium">Method</th>
              <th className="p-3 text-left font-medium">Description</th>
              <th className="p-3 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => {
              const toggleAction = toggle.bind(null, m.id, !m.isEnabled);
              return (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {m.sortOrder}
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{m.label}</p>
                    <p className="font-mono text-xs text-muted-foreground">{m.key}</p>
                  </td>
                  <td className="p-3 text-muted-foreground">{m.description || '—'}</td>
                  <td className="p-3 text-right">
                    <form action={toggleAction}>
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          m.isEnabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {m.isEnabled ? (
                          <>
                            <Eye className="h-3 w-3" /> Live
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" /> Hidden
                          </>
                        )}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Note: hiding all methods will block checkout. At least one method (usually
        COD) should stay enabled.
      </p>
    </div>
  );
}
