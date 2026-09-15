/**
 * Rwandan MSISDN handling.
 *
 * Mobile numbers are 07X XXX XXXX nationally / 2507X XXX XXXX internationally,
 * where X starts 2-9 (MTN 78/79, Airtel 72/73).
 */

const RWANDAN_MOBILE = /^250(7[2-9]\d{7})$/;

/** Normalises user input to the 2507XXXXXXXX form gateways expect, or null. */
export function toMsisdn(input?: string | null): string | null {
  if (!input) return null;

  let digits = input.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `250${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith('7')) digits = `250${digits}`;

  return RWANDAN_MOBILE.test(digits) ? digits : null;
}

export function isRwandanMobile(input?: string | null): boolean {
  return toMsisdn(input) !== null;
}

/** Formats for display: +250 788 123 456 */
export function formatMsisdn(input?: string | null): string {
  const msisdn = toMsisdn(input);
  if (!msisdn) return input ?? '';
  return `+${msisdn.slice(0, 3)} ${msisdn.slice(3, 6)} ${msisdn.slice(6, 9)} ${msisdn.slice(9)}`;
}
