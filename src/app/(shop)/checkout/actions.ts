'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import {
  orders,
  orderItems,
  products as productsTable,
  coupons as couponsTable,
  shippingZones as shippingZonesTable,
} from '@/lib/db/schema';
import { generateOrderNumber } from '@/lib/utils';
import { inArray, eq, sql } from 'drizzle-orm';
import { initiateKhaltiPayment } from '@/lib/payments/khalti';
import { computeShipping, type ShippingZoneLite } from '@/lib/shipping';
import { evaluateCoupon, normalizeCode } from '@/lib/coupons';
import { sendOrderConfirmationEmail } from '@/lib/email/order-confirmation';

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
  couponCode: z.string().optional(),
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

async function activeZones(): Promise<ShippingZoneLite[]> {
  const rows = await db
    .select()
    .from(shippingZonesTable)
    .where(eq(shippingZonesTable.isActive, true));
  return rows.map((z) => ({
    name: z.name,
    matchType: z.matchType,
    matchValue: z.matchValue,
    fee: z.fee,
    freeAbove: z.freeAbove,
  }));
}

// Returns whether this phone number has any previous orders (used for
// first-order-only coupons).
async function phoneHasOrders(phone: string): Promise<boolean> {
  const existing = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.customerPhone, phone))
    .limit(1);
  return existing.length > 0;
}

/**
 * Live coupon check for the checkout form. Returns the discount in paisa so the
 * summary can update before the order is placed. Always re-validated in
 * createOrder — never trust this value alone.
 */
export async function validateCoupon(input: {
  code: string;
  subtotal: number;
  phone?: string;
}): Promise<{ ok: true; discount: number; label: string } | { ok: false; error: string }> {
  const code = normalizeCode(input.code || '');
  if (!code) return { ok: false, error: 'Enter a coupon code.' };

  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(eq(couponsTable.code, code))
    .limit(1);

  if (!coupon) return { ok: false, error: 'That code is not valid.' };

  const result = evaluateCoupon(coupon, input.subtotal);
  if (!result.ok) return { ok: false, error: result.error || 'That code is not valid.' };

  if (coupon.firstOrderOnly) {
    if (!input.phone || input.phone.length < 10) {
      return { ok: false, error: 'Enter your phone number first — this code is for first orders.' };
    }
    if (await phoneHasOrders(input.phone)) {
      return { ok: false, error: 'This code is only valid on your first order.' };
    }
  }

  const label =
    coupon.discountType === 'percent'
      ? `${coupon.code} — ${coupon.discountValue}% off`
      : `${coupon.code}`;
  return { ok: true, discount: result.discount, label };
}

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

  // Shipping fee from admin-configured zones (authoritative).
  const zones = await activeZones();
  const shipping = computeShipping(
    zones,
    data.shippingProvince,
    data.shippingDistrict,
    subtotal
  );
  const shippingFee = shipping.fee;

  // Coupon (re-validated server-side; the client value is never trusted).
  let discount = 0;
  let appliedCoupon: { id: string; code: string } | null = null;
  if (data.couponCode) {
    const code = normalizeCode(data.couponCode);
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, code))
      .limit(1);
    if (coupon) {
      const result = evaluateCoupon(coupon, subtotal);
      const firstOrderOk =
        !coupon.firstOrderOnly || !(await phoneHasOrders(data.customerPhone));
      if (result.ok && firstOrderOk) {
        discount = result.discount;
        appliedCoupon = { id: coupon.id, code: coupon.code };
      }
    }
    // Silently ignore an invalid coupon at order time — the customer already
    // saw the error in the live preview and chose to proceed.
  }

  const total = Math.max(0, subtotal + shippingFee - discount);
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
      notes: appliedCoupon
        ? [data.notes, `Coupon: ${appliedCoupon.code}`].filter(Boolean).join(' · ')
        : data.notes,
      subtotal,
      shippingFee,
      discount,
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

  // Count the coupon redemption
  if (appliedCoupon) {
    await db
      .update(couponsTable)
      .set({ usedCount: sql`${couponsTable.usedCount} + 1`, updatedAt: new Date() })
      .where(eq(couponsTable.id, appliedCoupon.id));
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

  // COD: order is final now — send the confirmation email (non-blocking).
  // Gateway orders get their email from the payment-verify routes on success.
  if (data.paymentMethod === 'cod') {
    await sendOrderConfirmationEmail(newOrder.id).catch((err) =>
      console.error('Order confirmation email failed', err)
    );
  }

  // eSewa / Fonepay: redirect to a server page that submits the form
  return { ok: true, orderId: newOrder.id, orderNumber };
}
