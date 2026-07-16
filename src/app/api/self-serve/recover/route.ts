import {
  getLatestJobByEmail,
  getSelfServeBindings,
  hasEmailDeliveryConfig,
  issueJobRecoveryLink,
  jsonError,
  requestIp,
  sendJobAccessEmail,
  SelfServeConfigError,
  SelfServeError,
  verifyTurnstileToken,
} from '@/lib/self-serve/server';

export const dynamic = 'force-dynamic';

function normalizeEmail(value: unknown) {
  if (typeof value !== 'string') {
    throw new SelfServeError('Enter the email address used for the cleanup job.', 400);
  }

  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    throw new SelfServeError('Enter the email address used for the cleanup job.', 400);
  }
  return email;
}

function normalizeTurnstileToken(value: unknown) {
  if (typeof value !== 'string' || !value.trim() || value.length > 4096) {
    throw new SelfServeError('Complete the security check before requesting a link.', 400);
  }
  return value.trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      turnstileToken?: unknown;
    };
    const email = normalizeEmail(body.email);
    const turnstileToken = normalizeTurnstileToken(body.turnstileToken);
    const { db, env } = await getSelfServeBindings();

    if (!hasEmailDeliveryConfig(env)) {
      throw new SelfServeConfigError('Email delivery is not configured yet. Contact support for job recovery.');
    }

    await verifyTurnstileToken({
      env,
      token: turnstileToken,
      remoteIp: requestIp(request),
    });

    const job = await getLatestJobByEmail(db, email);
    if (job) {
      const link = await issueJobRecoveryLink({ db, env, job });
      await sendJobAccessEmail({
        env,
        job,
        accessUrl: link.url,
        expiresAt: link.expiresAt,
        purpose: 'recovery',
      });
    }

    return new Response(null, {
      status: 204,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError(new SelfServeError('Invalid recovery request.', 400));
    }
    return jsonError(error);
  }
}
