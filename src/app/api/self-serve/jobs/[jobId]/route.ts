import {
  getJob,
  getSelfServeBindings,
  jsonError,
  markPaidFromStripeSession,
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

function parseWarnings(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { jobId } = await readParams(context);
    const url = new URL(request.url);
    const token = url.searchParams.get('token') ?? '';
    const sessionId = url.searchParams.get('session_id') ?? '';
    const { db, env } = await getSelfServeBindings();
    let job = await getJob(db, jobId);

    await verifyJobToken(job, token);

    if (sessionId) {
      await markPaidFromStripeSession({
        db,
        env,
        job,
        sessionId,
      });
      job = await getJob(db, jobId);
    }

    const canDownload = job.payment_status === 'paid';
    const downloadUrl = canDownload
      ? `/api/self-serve/jobs/${encodeURIComponent(
          job.id
        )}/download?token=${encodeURIComponent(token)}${
          sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : ''
        }`
      : null;

    return Response.json(
      {
        job: {
          id: job.id,
          email: job.email,
          storeUrl: job.store_url,
          status: job.status,
          paymentStatus: job.payment_status,
          processedImageRows: job.processed_image_rows,
          changedRows: job.changed_rows,
          issueRows: job.issue_rows,
          totalImageRows: job.total_image_rows,
          detectedProducts: job.detected_products,
          warnings: parseWarnings(job.warnings_json),
          createdAt: job.created_at,
          paidAt: job.paid_at,
          firstDownloadedAt: job.first_downloaded_at,
          downloadCount: job.download_count,
          importStatus: job.import_status,
          importFeedback: job.import_feedback,
          importReportedAt: job.import_reported_at,
        },
        canDownload,
        downloadUrl,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError(new SelfServeError('Invalid request.', 400));
    }
    return jsonError(error);
  }
}
