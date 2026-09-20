import { env } from '../env';
import { ChargeRequest, ChargeResult, PaymentGateway, PaymentGatewayError } from './types';
import { toMsisdn } from './phone';

/**
 * MTN MoMo Collections — "Request to Pay".
 *
 * The flow is asynchronous: we POST a collection request, MTN pushes a USSD
 * prompt to the payer's handset, and the result arrives either on our callback
 * URL or via a status poll. A 202 therefore means PENDING, never SUCCESS.
 *
 * Docs: https://momodeveloper.mtn.com/api-documentation/api-description/
 */

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.token;
  }

  const basic = Buffer.from(`${env.MTN_MOMO_API_USER}:${env.MTN_MOMO_API_KEY}`).toString('base64');

  const res = await fetch(`${env.MTN_MOMO_BASE_URL}/collection/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Ocp-Apim-Subscription-Key': env.MTN_MOMO_SUBSCRIPTION_KEY!,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new PaymentGatewayError('Could not authenticate with MTN MoMo', await safeBody(res));
  }

  const body = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return tokenCache.token;
}

async function safeBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return { status: res.status, statusText: res.statusText };
  }
}

function baseHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'X-Target-Environment': env.MTN_MOMO_TARGET_ENVIRONMENT,
    'Ocp-Apim-Subscription-Key': env.MTN_MOMO_SUBSCRIPTION_KEY!,
  };
}

/** The MoMo sandbox only settles in EUR; live collections in Rwanda use RWF. */
function currencyFor(requested: string): string {
  return env.MTN_MOMO_TARGET_ENVIRONMENT === 'sandbox' ? 'EUR' : requested;
}

function mapStatus(status: string | undefined): ChargeResult['status'] {
  if (status === 'SUCCESSFUL') return 'SUCCESS';
  if (status === 'FAILED' || status === 'REJECTED' || status === 'TIMEOUT') return 'FAILED';
  return 'PENDING';
}

export const mtnMomoGateway: PaymentGateway = {
  id: 'mtn_momo',

  isConfigured() {
    return Boolean(env.MTN_MOMO_SUBSCRIPTION_KEY && env.MTN_MOMO_API_USER && env.MTN_MOMO_API_KEY);
  },

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    const msisdn = toMsisdn(request.payerPhone);
    if (!msisdn) {
      return {
        status: 'FAILED',
        message: 'Enter a valid Rwandan mobile money number, for example +250 788 000 000.',
      };
    }

    const token = await accessToken();

    // MTN keys the transaction on the reference *we* supply, which makes the
    // call idempotent: retrying with the same reference never double-charges.
    const res = await fetch(`${env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        ...baseHeaders(token),
        'X-Reference-Id': request.reference,
        'X-Callback-Url': request.callbackUrl,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(Math.round(request.amount)),
        currency: currencyFor(request.currency),
        externalId: request.reference,
        payer: { partyIdType: 'MSISDN', partyId: msisdn },
        payerMessage: request.description.slice(0, 160),
        payeeNote: request.description.slice(0, 160),
      }),
      cache: 'no-store',
    });

    if (res.status !== 202) {
      const raw = await safeBody(res);
      return {
        status: 'FAILED',
        message: 'MTN MoMo declined the collection request. Please try again or use another method.',
        raw,
      };
    }

    return {
      status: 'PENDING',
      providerRef: request.reference,
      message: 'Approve the payment prompt on your phone to confirm this reservation.',
    };
  },

  async getStatus(reference: string): Promise<ChargeResult> {
    const token = await accessToken();

    const res = await fetch(`${env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay/${reference}`, {
      headers: baseHeaders(token),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new PaymentGatewayError('Could not read the MTN MoMo transaction status', await safeBody(res));
    }

    const body = (await res.json()) as { status?: string; reason?: string };
    const status = mapStatus(body.status);

    return {
      status,
      providerRef: reference,
      message:
        status === 'SUCCESS'
          ? 'Mobile money payment confirmed.'
          : status === 'FAILED'
            ? `Payment was not completed${body.reason ? `: ${body.reason}` : '.'}`
            : 'Waiting for the payer to approve the prompt.',
      raw: body,
    };
  },
};
