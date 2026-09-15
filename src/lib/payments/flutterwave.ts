import { env } from '../env';
import { ChargeRequest, ChargeResult, PaymentGateway, PaymentGatewayError } from './types';
import { formatMsisdn } from './phone';

/**
 * Flutterwave Standard checkout — used for card payments and, where MTN direct
 * collection is not enabled, for Airtel Money.
 *
 * `POST /payments` returns a hosted payment link; the customer completes the
 * payment there and Flutterwave notifies us on the webhook. Nothing is treated
 * as settled until `/transactions/{id}/verify` confirms it.
 *
 * Docs: https://developer.flutterwave.com/docs/collecting-payments/standard/
 */

async function safeBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return { status: res.status, statusText: res.statusText };
  }
}

function authHeaders() {
  return {
    Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

function paymentOptionsFor(provider: ChargeRequest['provider']): string {
  if (provider === 'AIRTEL_MONEY') return 'mobilemoneyrwanda';
  if (provider === 'MTN_MOMO') return 'mobilemoneyrwanda';
  return 'card';
}

export const flutterwaveGateway: PaymentGateway = {
  id: 'flutterwave',

  isConfigured() {
    return Boolean(env.FLUTTERWAVE_SECRET_KEY);
  },

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    const res = await fetch(`${env.FLUTTERWAVE_BASE_URL}/payments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        tx_ref: request.reference,
        amount: request.amount,
        currency: request.currency,
        redirect_url: request.returnUrl,
        payment_options: paymentOptionsFor(request.provider),
        customer: {
          email: request.customer.email,
          name: request.customer.name,
          phonenumber: formatMsisdn(request.payerPhone),
        },
        customizations: {
          title: 'Higa Lux Rwanda',
          description: request.description.slice(0, 120),
        },
        meta: { reference: request.reference },
      }),
      cache: 'no-store',
    });

    const body = (await safeBody(res)) as { status?: string; message?: string; data?: { link?: string } };

    if (!res.ok || body.status !== 'success' || !body.data?.link) {
      return {
        status: 'FAILED',
        message: body.message || 'The card gateway could not start this payment. Please try again.',
        raw: body,
      };
    }

    return {
      status: 'PENDING',
      providerRef: request.reference,
      redirectUrl: body.data.link,
      message: 'Complete the payment in the secure checkout window to confirm this reservation.',
      raw: body,
    };
  },

  async getStatus(reference: string): Promise<ChargeResult> {
    const res = await fetch(
      `${env.FLUTTERWAVE_BASE_URL}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
      { headers: authHeaders(), cache: 'no-store' }
    );

    // A reference the gateway has never seen means the customer abandoned the
    // hosted checkout before paying — still pending, not an error.
    if (res.status === 404) {
      return { status: 'PENDING', providerRef: reference, message: 'Awaiting completion of the checkout.' };
    }

    if (!res.ok) {
      throw new PaymentGatewayError('Could not read the Flutterwave transaction status', await safeBody(res));
    }

    const body = (await res.json()) as {
      data?: { status?: string; id?: number; amount?: number; currency?: string; processor_response?: string };
    };

    const gatewayStatus = body.data?.status;
    const status: ChargeResult['status'] =
      gatewayStatus === 'successful' ? 'SUCCESS' : gatewayStatus === 'pending' ? 'PENDING' : 'FAILED';

    return {
      status,
      providerRef: body.data?.id ? String(body.data.id) : reference,
      message:
        status === 'SUCCESS'
          ? 'Card payment confirmed.'
          : status === 'PENDING'
            ? 'Awaiting completion of the checkout.'
            : `Payment was not completed${body.data?.processor_response ? `: ${body.data.processor_response}` : '.'}`,
      raw: body.data,
    };
  },
};

/**
 * Verifies the `verif-hash` header Flutterwave sends with every webhook.
 * Uses a length-safe constant-time comparison so the secret cannot be
 * recovered by timing the endpoint.
 */
export function verifyFlutterwaveSignature(headerValue: string | null): boolean {
  const expected = env.FLUTTERWAVE_WEBHOOK_HASH;
  if (!expected || !headerValue) return false;
  if (headerValue.length !== expected.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ headerValue.charCodeAt(i);
  }
  return mismatch === 0;
}
