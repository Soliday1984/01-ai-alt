import {
  createCheckoutSession,
  getJob,
  getSelfServeBindings,
  jsonError,
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
    const body = await request.json();
    const jobId = readString(body?.jobId, 'Job ID');
    const token = readString(body?.token, 'Job token');
    const { db, env } = await getSelfServeBindings();
    const job = await getJob(db, jobId);

    await verifyJobToken(job, token);

    const session = await createCheckoutSession({
      env,
      request,
      job,
      token,
    });

    await updateCheckoutSession(db, job.id, session.id);

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
