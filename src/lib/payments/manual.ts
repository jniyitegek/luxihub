import { ChargeRequest, ChargeResult, PaymentGateway } from './types';

/**
 * Back-office reconciliation rail.
 *
 * This is the default before a gateway goes live. It records the intent to pay
 * and leaves the payment PENDING for an administrator to confirm against the
 * bank or MoMo merchant statement. It deliberately never reports SUCCESS on
 * its own — the previous build auto-approved every payment, which confirmed
 * bookings that had not been paid for.
 */
export const manualGateway: PaymentGateway = {
  id: 'manual',

  isConfigured() {
    return true;
  },

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    return {
      status: 'PENDING',
      providerRef: request.reference,
      message:
        'Your reservation is held. Send the payment using the instructions emailed to you — our team confirms it within one business day.',
      raw: { rail: 'manual', reference: request.reference, amount: request.amount, currency: request.currency },
    };
  },

  async getStatus(reference: string): Promise<ChargeResult> {
    return {
      status: 'PENDING',
      providerRef: reference,
      message: 'Awaiting manual confirmation by the Higa Lux finance team.',
    };
  },
};
