import { env } from '../env';
import { flutterwaveGateway } from './flutterwave';
import { manualGateway } from './manual';
import { mtnMomoGateway } from './mtnMomo';
import { PaymentGateway, PaymentProviderId } from './types';

export * from './types';
export { toMsisdn, isRwandanMobile, formatMsisdn } from './phone';
export { verifyFlutterwaveSignature } from './flutterwave';

const GATEWAYS: Record<string, PaymentGateway> = {
  mtn_momo: mtnMomoGateway,
  flutterwave: flutterwaveGateway,
  manual: manualGateway,
};

export const SUPPORTED_PROVIDERS: PaymentProviderId[] = ['MTN_MOMO', 'AIRTEL_MONEY', 'CARD', 'FLUTTERWAVE'];

/**
 * Resolves the gateway that handles a given payment rail.
 *
 * Mobile money and cards are configured independently so a deployment can go
 * live on MoMo while cards are still being certified. A rail whose credentials
 * are missing falls back to manual reconciliation rather than silently
 * approving the payment.
 */
export function gatewayFor(provider: PaymentProviderId): PaymentGateway {
  const railKey = provider === 'CARD' ? env.PAYMENTS_CARD_PROVIDER : env.PAYMENTS_MOMO_PROVIDER;
  const gateway = GATEWAYS[railKey] ?? manualGateway;
  return gateway.isConfigured() ? gateway : manualGateway;
}

/** Which gateway a webhook belongs to, used to reject misrouted callbacks. */
export function isRailEnabled(railKey: 'mtn_momo' | 'flutterwave'): boolean {
  return env.PAYMENTS_CARD_PROVIDER === railKey || env.PAYMENTS_MOMO_PROVIDER === railKey;
}
