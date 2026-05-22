/**
 * Fonepay Merchant Payment Integration
 * Docs: https://merchant.fonepay.com (developer portal)
 *
 * Flow:
 * 1. Server generates HMAC-SHA512 signature
 * 2. Submit form to Fonepay with order details
 * 3. User pays via QR / mobile banking
 * 4. Fonepay redirects to RU with response params
 * 5. Server verifies the DV (data verification) hash
 */
import CryptoJS from 'crypto-js';

const MERCHANT_CODE = process.env.FONEPAY_MERCHANT_CODE || '';
const SECRET_KEY = process.env.FONEPAY_SECRET_KEY || '';
const GATEWAY_URL =
  process.env.FONEPAY_GATEWAY_URL || 'https://dev-clientapi.fonepay.com/api/merchantRequest';

export interface FonepayParams {
  amount: number; // NPR (not paisa)
  prn: string; // unique order reference
  returnUrl: string;
  remarks1?: string;
  remarks2?: string;
}

export interface FonepayFormData {
  PID: string;
  MD: string; // mode: 'P' for payment
  AMT: string;
  CRN: string; // currency: NPR
  DT: string; // date MM/DD/YYYY
  R1: string;
  R2: string;
  PRN: string;
  RU: string;
  DV: string; // hash signature
  gatewayUrl: string;
}

function generateHash(message: string): string {
  return CryptoJS.HmacSHA512(message, SECRET_KEY).toString(CryptoJS.enc.Hex);
}

export function getFonepayFormData(params: FonepayParams): FonepayFormData {
  const now = new Date();
  const dt = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(
    now.getDate()
  ).padStart(2, '0')}/${now.getFullYear()}`;
  const amount = params.amount.toFixed(2);
  const r1 = params.remarks1 || 'Order Payment';
  const r2 = params.remarks2 || 'Nepal Shop';

  // Per Fonepay docs, signed string is comma-separated in this order
  const message = [
    MERCHANT_CODE,
    params.prn,
    amount,
    'NPR',
    dt,
    r1,
    r2,
    params.returnUrl,
  ].join(',');

  return {
    PID: MERCHANT_CODE,
    MD: 'P',
    AMT: amount,
    CRN: 'NPR',
    DT: dt,
    R1: r1,
    R2: r2,
    PRN: params.prn,
    RU: params.returnUrl,
    DV: generateHash(message),
    gatewayUrl: GATEWAY_URL,
  };
}

export interface FonepayVerifyParams {
  PRN: string;
  PID: string;
  PS: string; // payment status: 'true' / 'false'
  RC: string; // response code
  UID: string; // unique ID from Fonepay
  BC: string; // bank code
  INI: string;
  P_AMT: string;
  R_AMT: string;
  DV: string; // hash to verify
}

export function verifyFonepayResponse(params: FonepayVerifyParams): boolean {
  // Reconstruct hash and compare
  const message = [
    params.PRN,
    params.PID,
    params.PS,
    params.RC,
    params.UID,
    params.BC,
    params.INI,
    params.P_AMT,
    params.R_AMT,
  ].join(',');
  const expected = generateHash(message);
  return (
    expected.toLowerCase() === params.DV.toLowerCase() && params.PS === 'true'
  );
}
