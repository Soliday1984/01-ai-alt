import {
  getJob,
  getSelfServeBindings,
  jsonError,
  markPaidFromStripeSession,
  markJobDownloaded,
  recordSelfServeEvent,
  SelfServeError,
  verifyJobToken,
} from '@/lib/self-serve/server';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ jobId: string }> | { jobId: string };
};

async function readParams(context: RouteContext) {
  return await context.params;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { jobId } = await readParams(context);
    const url = new URL(request.url);
    const token = url.searchParams.get('token') ?? '';
    const sessionId = url.searchParams.get('session_id') ?? '';
    const { db, env, uploads } = await getSelfServeBindings();
    let job = await getJob(db, jobId);

    await verifyJobToken(job, token, db);

    if (job.payment_status !== 'paid' && sessionId) {
      await markPaidFromStripeSession({
        db,
        env,
        job,
        sessionId,
      });
      job = await getJob(db, jobId);
    }

    if (job.payment_status !== 'paid') {
      throw new SelfServeError('Payment is required before downloading the cleaned CSV.', 402);
    }

    const object = await uploads.get(job.cleaned_key);
    if (!object?.body) {
      throw new SelfServeError('Cleaned CSV was not found. Contact support with your job ID.', 404);
    }

    await markJobDownloaded(db, job.id);
    await recordSelfServeEvent(db, job.id, 'csv_downloaded');

    return new Response(object.body, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `attachment; filename="imageseofix-cleaned-${job.id}.csv"`,
        'Content-Type': 'text/csv; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
