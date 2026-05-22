/**
 * Khalti Payment Gateway v2 (ePayment)
 * Docs: https://docs.khalti.com/khalti-epayment/
 *
 * Flow:
 * 1. Server POSTs to /epayment/initiate/ with order details
 * 2. Khalti returns a payment_url + pidx
 * 3. Redirect user to payment_url
 * 4. User pays, gets redirected back with pidx
 * 5. Server calls /epayment/lookup/ with pidx to verify
 */

const SECRET_KEY = process.env.KHALTI_SECRET_KEY || '';
const GATEWAY_URL =
  process.env.KHALTI_GATEWAY_URL || 'https://dev.khalti.com/api/v2/epayment/initiate/';
const LOOKUP_URL =
  process.env.KHALTI_LOOKUP_URL || 'https://dev.khalti.com/api/v2/epayment/lookup/';

export interface KhaltiInitiateParams {
  amount: number; // in paisa
  purchaseOrderId: string;
  purchaseOrderName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  websiteUrl: string;
}

export interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

export async function initiateKhaltiPayment(
  params: KhaltiInitiateParams
): Promise<KhaltiInitiateResponse> {
  const body = {
    return_url: params.returnUrl,
    website_url: params.websiteUrl,
    amount: params.amount,
    purchase_order_id: params.purchaseOrderId,
    purchase_order_name: params.purchaseOrderName,
    customer_info: {
      name: params.customerName,
      email: params.customerEmail,
      phone: params.customerPhone,
    },
  };

  const res = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Key ${SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Khalti initiate failed: ${res.status} ${text}`);
  }

  return (await res.json()) as KhaltiInitiateResponse;
}

export interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status: 'Completed' | 'Pending' | 'Initiated' | 'Refunded' | 'Expired' | 'User canceled';
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
}

export async function verifyKhaltiPayment(pidx: string): Promise<KhaltiLookupResponse> {
  const res = await fetch(LOOKUP_URL, {
    method: 'POST',
    headers: {
      Authorization: `Key ${SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pidx }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Khalti lookup failed: ${res.status} ${text}`);
  }

  return (await res.json()) as KhaltiLookupResponse;
}
