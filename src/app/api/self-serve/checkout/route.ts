import {
  assertSelfServeEnabled,
  createCheckoutSession,
  getJob,
  getSelfServeBindings,
  isReusableCheckoutSession,
  jsonError,
  recordSelfServeEvent,
  retrieveCheckoutSession,
  SelfServeError,
  updateCheckoutSession,
  verifyJobToken,
} from '@/lib/self-serve/server';

export const dynamic = 'force-dynamic';

function readString(value: unknown, label: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new SelfServeError(`${label} is required.`, 400);
  }
  return value.trim();
}

export async function POST(request: Request) {
  try {
    const { db, env } = await getSelfServeBindings();

    assertSelfServeEnabled(env);

    const body = (await request.json()) as { jobId?: unknown; token?: unknown };
    const jobId = readString(body?.jobId, 'Job ID');
    const token = readString(body?.token, 'Job token');
    const job = await getJob(db, jobId);

    await verifyJobToken(job, token, db);

    if (job.payment_status === 'paid') {
      throw new SelfServeError(
        'This cleanup job is already paid. Reopen its secure job link to download the CSV.',
        409
      );
    }

    if (job.checkout_session_id) {
      const existing = await retrieveCheckoutSession(env, job.checkout_session_id);
      if (isReusableCheckoutSession({ env, job, session: existing })) {
        return Response.json(
          {
            checkoutUrl: existing.url,
            sessionId: existing.id,
            reused: true,
          },
          {
            headers: {
              'Cache-Control': 'no-store',
              'X-Content-Type-Options': 'nosniff',
            },
          }
        );
      }
    }

    const session = await createCheckoutSession({
      env,
      request,
      job,
      token,
    });

    await updateCheckoutSession(db, job.id, session.id);
    await recordSelfServeEvent(db, job.id, 'checkout_started', {
      internalE2E: Boolean(
        env.IMAGESEOFIX_E2E_EMAIL &&
          env.STRIPE_E2E_PROMOTION_CODE &&
          job.email.trim().toLowerCase() === env.IMAGESEOFIX_E2E_EMAIL.trim().toLowerCase()
      ),
    });

    return Response.json(
      {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    return jsonError(error);
  }
}
