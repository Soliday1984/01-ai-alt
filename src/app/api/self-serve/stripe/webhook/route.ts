import {
  getJob,
  getSelfServeBindings,
  jsonError,
  markPaidFromStripeSession,
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
        product?: string;
      };
      payment_status?: string | null;
      amount_total?: number | null;
      currency?: string | null;
      livemode?: boolean;
      mode?: string | null;
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
    if (
      !session.id ||
      !jobId ||
      session.payment_status !== 'paid' ||
      session.metadata?.product !== 'imageseofix_self_serve_csv_v1'
    ) {
      return Response.json({ received: true, ignored: true });
    }

    const job = await getJob(db, jobId);
    const verified = await markPaidFromStripeSession({
      db,
      env,
      job,
      sessionId: session.id,
    });
    if (!verified) {
      throw new SelfServeError('Stripe payment verification did not match this job.', 409);
    }

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
