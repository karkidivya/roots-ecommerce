import { Resend } from 'resend';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';

const BRAND = process.env.NEXT_PUBLIC_APP_NAME || 'Grain Roots';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Send the order confirmation email for a given order id. No-ops (and logs)
 * when RESEND_API_KEY is unset or the order has no email, so it is always safe
 * to call and never blocks the checkout flow.
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn('[email] RESEND_API_KEY / RESEND_FROM_EMAIL not set — skipping order email');
    return;
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return;
  if (!order.customerEmail) return; // guest checked out without an email

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const resend = new Resend(apiKey);
  const orderUrl = `${APP_URL}/order/${order.id}`;

  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">
          ${escapeHtml(i.productName)}<br>
          <span style="color:#888;font-size:13px">Qty ${i.quantity} × ${formatPrice(i.price)}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">
          ${formatPrice(i.subtotal)}
        </td>
      </tr>`
    )
    .join('');

  const discountRow =
    order.discount > 0
      ? `<tr><td style="padding:4px 0;color:#0a7a3f">Discount</td><td style="padding:4px 0;text-align:right;color:#0a7a3f">− ${formatPrice(order.discount)}</td></tr>`
      : '';

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
    <h1 style="font-size:20px;margin:0 0 4px">Thank you for your order!</h1>
    <p style="color:#555;margin:0 0 20px">
      Hi ${escapeHtml(order.customerName)}, we've received your order
      <strong>${order.orderNumber}</strong> and will be in touch shortly to confirm delivery.
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows}
    </table>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px">
      <tr><td style="padding:4px 0;color:#666">Subtotal</td><td style="padding:4px 0;text-align:right">${formatPrice(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#666">Shipping</td><td style="padding:4px 0;text-align:right">${order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</td></tr>
      ${discountRow}
      <tr><td style="padding:8px 0;font-weight:600;border-top:1px solid #ddd">Total</td><td style="padding:8px 0;text-align:right;font-weight:600;border-top:1px solid #ddd">${formatPrice(order.total)}</td></tr>
    </table>

    <p style="font-size:14px;color:#555;margin-top:20px">
      <strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}<br>
      <strong>Delivering to:</strong> ${escapeHtml(order.shippingAddress)}, ${escapeHtml(order.shippingMunicipality)}, ${escapeHtml(order.shippingDistrict)}, ${escapeHtml(order.shippingProvince)}
    </p>

    <p style="margin-top:24px">
      <a href="${orderUrl}" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:11px 20px;border-radius:6px;font-size:14px;display:inline-block">
        Track your order
      </a>
    </p>

    <p style="color:#999;font-size:12px;margin-top:28px;border-top:1px solid #eee;padding-top:16px">
      ${escapeHtml(BRAND)} · This is an automated confirmation for order ${order.orderNumber}.
    </p>
  </div>`;

  await resend.emails.send({
    from: `${BRAND} <${from}>`,
    to: order.customerEmail,
    subject: `Order ${order.orderNumber} confirmed — ${BRAND}`,
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
