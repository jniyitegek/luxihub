export type PaymentProviderId = 'MTN_MOMO' | 'AIRTEL_MONEY' | 'CARD' | 'FLUTTERWAVE';

export type ChargeStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface ChargeRequest {
  /** Our own idempotent reference; echoed back by the gateway. */
  reference: string;
  /** Minor-unit-free amount, already validated against the booking server-side. */
  amount: number;
  currency: string;
  provider: PaymentProviderId;
  payerPhone?: string;
  customer: { name: string; email: string };
  description: string;
  /** Absolute URL the customer returns to after a hosted checkout. */
  returnUrl: string;
  /** Absolute URL the gateway posts asynchronous results to. */
  callbackUrl: string;
}

export interface ChargeResult {
  status: ChargeStatus;
  /** The gateway's own identifier for the transaction, when it issues one. */
  providerRef?: string;
  /** Where to send the customer to complete a hosted (card) payment. */
  redirectUrl?: string;
  /** Human-readable explanation, shown to the customer on failure. */
  message: string;
  /** Raw gateway response, persisted for reconciliation and support. */
  raw?: unknown;
}

export interface PaymentGateway {
  readonly id: string;
  /** False when the rail is configured but credentials are absent. */
  isConfigured(): boolean;
  charge(request: ChargeRequest): Promise<ChargeResult>;
  /** Re-reads authoritative status from the gateway. */
  getStatus(reference: string, providerRef?: string): Promise<ChargeResult>;
}

export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    readonly raw?: unknown
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}
