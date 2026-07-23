import {
  getJob,
  getSelfServeBindings,
  jsonError,
  recordSelfServeEvent,
  saveImportFeedback,
  SelfServeError,
  verifyJobToken,
} from '@/lib/self-serve/server';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ jobId: string }> | { jobId: string };
};

const allowedStatuses = new Set(['success', 'issue', 'not_imported']);

async function readParams(context: RouteContext) {
  return await context.params;
}

function readFeedback(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, 500);
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { jobId } = await readParams(context);
    const token = new URL(request.url).searchParams.get('token') ?? '';
    const body = (await request.json()) as { status?: unknown; feedback?: unknown };
    const status = typeof body.status === 'string' ? body.status : '';
    if (!allowedStatuses.has(status)) {
      throw new SelfServeError('Choose an import result before submitting feedback.', 400);
    }

    const { db } = await getSelfServeBindings();
    const job = await getJob(db, jobId);
    await verifyJobToken(job, token, db);
    if (job.payment_status !== 'paid') {
      throw new SelfServeError('Payment is required before reporting an import result.', 402);
    }

    await saveImportFeedback(
      db,
      job.id,
      status as 'success' | 'issue' | 'not_imported',
      readFeedback(body.feedback)
    );
    await recordSelfServeEvent(db, job.id, 'import_feedback_saved', { status });

    return new Response(null, {
      status: 204,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError(new SelfServeError('Invalid feedback request.', 400));
    }
    return jsonError(error);
  }
}
