import {
  getSelfServeBindings,
  jsonError,
  markJobPaid,
  SelfServeError,
  verifyStripeWebhookSignature,
} from '@/lib/self-serve/server';

export const dynamic = 'force-dynamic';

const maxWebhookBytes = 1_000_000;

type StripeWebhookEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: {
      id?: string;
      client_reference_id?: string | null;
      metadata?: {
        job_id?: string;
      };
      payment_status?: string | null;
    };
  };
};

function checkoutSessionFromEvent(event: StripeWebhookEvent) {
  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    return null;
  }

  return event.data?.object ?? null;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maxWebhookBytes) {
      throw new SelfServeError('Stripe webhook payload is too large.', 413);
    }

    const { db, env } = await getSelfServeBindings();
    await verifyStripeWebhookSignature({
      env,
      rawBody,
      signatureHeader: request.headers.get('stripe-signature'),
    });

    const event = JSON.parse(rawBody) as StripeWebhookEvent;
    const session = checkoutSessionFromEvent(event);
    if (!session) {
      return Response.json({ received: true, ignored: true });
    }

    const jobId = session.client_reference_id || session.metadata?.job_id || '';
    if (!session.id || !jobId || session.payment_status !== 'paid') {
      return Response.json({ received: true, ignored: true });
    }

    await markJobPaid(db, jobId, session.id);

    return Response.json(
      { received: true },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError(new SelfServeError('Invalid Stripe webhook payload.', 400));
    }
    return jsonError(error);
  }
}
