'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { orders, orderItems, products as productsTable } from '@/lib/db/schema';
import { generateOrderNumber } from '@/lib/utils';
import { inArray, eq, sql } from 'drizzle-orm';
import { initiateKhaltiPayment } from '@/lib/payments/khalti';
import { redirect } from 'next/navigation';

const CheckoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z
    .string()
    .email()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  customerPhone: z.string().min(10),
  shippingProvince: z.string().min(1),
  shippingDistrict: z.string().min(1),
  shippingMunicipality: z.string().min(1),
  shippingWard: z.string().optional(),
  shippingAddress: z.string().min(3),
  shippingLandmark: z.string().optional(),
  shippingLat: z.string().optional(),
  shippingLng: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['esewa', 'khalti', 'fonepay', 'cod']),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

export async function createOrder(
  input: CheckoutInput
): Promise<
  | { ok: true; orderId: string; orderNumber: string; redirectUrl?: string }
  | { ok: false; error: string }
> {
  const parsed = CheckoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid input: ' + parsed.error.issues[0].message };
  }
  const data = parsed.data;

  // Fetch & validate products
  const productIds = data.items.map((i) => i.productId);
  const productsInOrder = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, productIds));

  if (productsInOrder.length !== productIds.length) {
    return { ok: false, error: 'Some products were not found.' };
  }

  let subtotal = 0;
  const orderItemsData = [];

  for (const item of data.items) {
    const product = productsInOrder.find((p) => p.id === item.productId);
    if (!product) return { ok: false, error: `Product ${item.productId} not found.` };
    if (!product.isActive)
      return { ok: false, error: `${product.name} is no longer available.` };
    if (product.stock < item.quantity) {
      return {
        ok: false,
        error: `Only ${product.stock} of ${product.name} available.`,
      };
    }
    const itemSubtotal = product.price * item.quantity;
    subtotal += itemSubtotal;
    orderItemsData.push({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || null,
      price: product.price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  // Flat shipping fee (Rs 100 = 10000 paisa). Customize as needed.
  const shippingFee = 10000;
  const total = subtotal + shippingFee;
  const orderNumber = generateOrderNumber();

  // Insert order + items + decrement stock
  const [newOrder] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone,
      shippingProvince: data.shippingProvince,
      shippingDistrict: data.shippingDistrict,
      shippingMunicipality: data.shippingMunicipality,
      shippingWard: data.shippingWard,
      shippingAddress: data.shippingAddress,
      shippingLandmark: data.shippingLandmark,
      shippingLat: data.shippingLat || null,
      shippingLng: data.shippingLng || null,
      notes: data.notes,
      subtotal,
      shippingFee,
      total,
      paymentMethod: data.paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
    })
    .returning();

  await db
    .insert(orderItems)
    .values(orderItemsData.map((i) => ({ ...i, orderId: newOrder.id })));

  // Decrement stock
  for (const item of data.items) {
    await db
      .update(productsTable)
      .set({ stock: sql`${productsTable.stock} - ${item.quantity}` })
      .where(eq(productsTable.id, item.productId));
  }

  // Handle Khalti: server-side initiate, return payment_url
  if (data.paymentMethod === 'khalti') {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const khaltiRes = await initiateKhaltiPayment({
        amount: total, // paisa
        purchaseOrderId: orderNumber,
        purchaseOrderName: `Order ${orderNumber}`,
        customerName: data.customerName,
        customerEmail: data.customerEmail || `${data.customerPhone}@noemail.local`,
        customerPhone: data.customerPhone,
        returnUrl: `${appUrl}/api/payment/khalti/verify?orderId=${newOrder.id}`,
        websiteUrl: appUrl,
      });
      return {
        ok: true,
        orderId: newOrder.id,
        orderNumber,
        redirectUrl: khaltiRes.payment_url,
      };
    } catch (err) {
      console.error('Khalti initiate failed', err);
      return { ok: false, error: 'Khalti payment could not be started.' };
    }
  }

  // eSewa / Fonepay: redirect to a server page that submits the form
  return { ok: true, orderId: newOrder.id, orderNumber };
}
