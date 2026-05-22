/**
 * eSewa ePay v2 integration
 * Docs: https://developer.esewa.com.np/pages/Epay
 *
 * Flow:
 * 1. Generate HMAC-SHA256 signature on server
 * 2. Submit form to eSewa with order details + signature
 * 3. User completes payment on eSewa
 * 4. eSewa redirects to success_url with base64-encoded response
 * 5. Server verifies the response by calling status check API
 */
import CryptoJS from 'crypto-js';

const MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
const SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const GATEWAY_URL =
  process.env.ESEWA_GATEWAY_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const VERIFY_URL =
  process.env.ESEWA_VERIFY_URL || 'https://rc.esewa.com.np/api/epay/transaction/status/';

export interface EsewaPaymentParams {
  amount: number; // in NPR (not paisa)
  productCode: string; // unique transaction ID (use order number)
  successUrl: string;
  failureUrl: string;
}

export interface EsewaFormData {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
  gatewayUrl: string;
}

function generateSignature(message: string): string {
  const hash = CryptoJS.HmacSHA256(message, SECRET_KEY);
  return CryptoJS.enc.Base64.stringify(hash);
}

export function getEsewaFormData(params: EsewaPaymentParams): EsewaFormData {
  const amount = params.amount.toFixed(2);
  const taxAmount = '0';
  const totalAmount = amount;
  const transactionUuid = params.productCode;
  const productCode = MERCHANT_CODE;

  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = generateSignature(message);

  return {
    amount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
    product_code: productCode,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: params.successUrl,
    failure_url: params.failureUrl,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature,
    gatewayUrl: GATEWAY_URL,
  };
}

export interface EsewaVerifyResponse {
  product_code: string;
  transaction_uuid: string;
  total_amount: number;
  status: 'COMPLETE' | 'PENDING' | 'FULL_REFUND' | 'PARTIAL_REFUND' | 'AMBIGUOUS' | 'NOT_FOUND' | 'CANCELED';
  ref_id?: string;
}

export async function verifyEsewaPayment(
  transactionUuid: string,
  totalAmount: number
): Promise<EsewaVerifyResponse | null> {
  try {
    const url = `${VERIFY_URL}?product_code=${MERCHANT_CODE}&total_amount=${totalAmount.toFixed(
      2
    )}&transaction_uuid=${transactionUuid}`;
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as EsewaVerifyResponse;
  } catch (err) {
    console.error('eSewa verify error:', err);
    return null;
  }
}

export function decodeEsewaResponse(encoded: string): {
  transaction_code: string;
  status: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  signature: string;
} | null {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
