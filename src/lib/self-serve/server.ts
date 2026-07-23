import { getCloudflareContext } from '@opennextjs/cloudflare';

import type { SelfServeCsvStats } from './csv';

type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>() => Promise<T | null>;
  all: <T = unknown>() => Promise<{ results?: T[] }>;
  run: () => Promise<{ meta?: { changes?: number } }>;
};

type D1DatabaseBinding = {
  prepare: (query: string) => D1PreparedStatement;
};

type R2ObjectBody = {
  body: ReadableStream | null;
};

type R2BucketBinding = {
  put: (key: string, value: string, options?: unknown) => Promise<unknown>;
  get: (key: string) => Promise<R2ObjectBody | null>;
};

type SelfServeEnv = Omit<CloudflareEnv, 'EMAIL'> & {
  // Optional here keeps Node-based unit tests and local development from sending real email.
  EMAIL?: CloudflareEnv['EMAIL'];
  IMAGESEOFIX_DB?: D1DatabaseBinding;
  IMAGESEOFIX_UPLOADS?: R2BucketBinding;
  SELF_SERVE_ENABLED?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_STARTER_PRICE_ID?: string;
  IMAGESEOFIX_E2E_EMAIL?: string;
  STRIPE_E2E_PROMOTION_CODE?: string;
  TURNSTILE_SECRET_KEY?: string;
  EMAIL_PROVIDER?: string;
  CLOUDFLARE_EMAIL_FROM?: string;
  BREVO_API_KEY?: string;
  BREVO_FROM_EMAIL?: string;
  MAILJET_API_KEY?: string;
  MAILJET_API_SECRET?: string;
  MAILJET_FROM_EMAIL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_SELF_SERVE_ENABLED?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
};

export type SelfServeBindings = {
  db: D1DatabaseBinding;
  uploads: R2BucketBinding;
  env: SelfServeEnv;
};

export type SelfServeJobRow = {
  id: string;
  email: string;
  store_url: string | null;
  original_key: string;
  cleaned_key: string;
  token_hash: string;
  status: string;
  payment_status: string;
  checkout_session_id: string | null;
  processed_image_rows: number;
  changed_rows: number;
  issue_rows: number;
  total_image_rows: number;
  detected_products: number;
  warnings_json: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  first_downloaded_at: string | null;
  download_count: number;
  import_status: string | null;
  import_feedback: string | null;
  import_reported_at: string | null;
  recovery_token_hash: string | null;
  recovery_token_expires_at: string | null;
};

export type CreateJobInput = {
  id: string;
  email: string;
  storeUrl: string;
  originalKey: string;
  cleanedKey: string;
  tokenHash: string;
  stats: SelfServeCsvStats;
};

export type StripeCheckoutSession = {
  id: string;
  url?: string;
  status?: string | null;
  client_reference_id?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  livemode?: boolean;
  mode?: string | null;
  metadata?: {
    job_id?: string;
    product?: string;
    e2e?: string;
  };
  total_details?: {
    amount_discount?: number | null;
  };
};

export type SelfServeFunnelEvent =
  | 'job_created'
  | 'checkout_started'
  | 'payment_verified'
  | 'csv_downloaded'
  | 'import_feedback_saved'
  | 'recovery_link_issued';

export class SelfServeError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'SelfServeError';
    this.status = status;
  }
}

export class SelfServeConfigError extends SelfServeError {
  constructor(message: string) {
    super(message, 503);
    this.name = 'SelfServeConfigError';
  }
}

export function jsonError(error: unknown) {
  const status =
    error instanceof SelfServeError
      ? error.status
      : error instanceof Error && 'status' in error && typeof error.status === 'number'
        ? error.status
        : 500;
  const message =
    error instanceof Error
      ? error.message
      : 'Unable to complete this self-serve request.';

  return Response.json(
    { error: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}

export async function getSelfServeBindings(): Promise<SelfServeBindings> {
  const context = await getCloudflareContext({ async: true });
  const env = context.env as SelfServeEnv;

  if (!env.IMAGESEOFIX_DB || !env.IMAGESEOFIX_UPLOADS) {
    throw new SelfServeConfigError(
      'Self-serve storage is not configured yet. Connect Cloudflare D1 and R2 before accepting CSV uploads.'
    );
  }

  return {
    db: env.IMAGESEOFIX_DB,
    uploads: env.IMAGESEOFIX_UPLOADS,
    env,
  };
}

function isTrueFlag(value: unknown) {
  return typeof value === 'string' && value.trim().toLowerCase() === 'true';
}

export function assertSelfServeEnabled(env: SelfServeEnv) {
  const enabled =
    isTrueFlag(env.SELF_SERVE_ENABLED) ||
    isTrueFlag(process.env.SELF_SERVE_ENABLED);

  if (!enabled) {
    throw new SelfServeError(
      'Self-serve CSV cleanup is not accepting uploads yet. Use the free audit or contact support for the paid cleanup.',
      403
    );
  }
}

export function publicSiteUrl(env: SelfServeEnv, request?: Request) {
  if (env.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (request) {
    return new URL(request.url).origin;
  }
  return 'https://imageseofix.com';
}

function requireTurnstileSecret(env: SelfServeEnv) {
  const secret = env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new SelfServeConfigError(
      'Security check is not configured yet. Add TURNSTILE_SECRET_KEY before enabling self-serve uploads.'
    );
  }
  return secret;
}

export function requestIp(request: Request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null
  );
}

export async function verifyTurnstileToken(input: {
  env: SelfServeEnv;
  token: string;
  remoteIp?: string | null;
}) {
  if (!input.token || input.token.length > 4096) {
    throw new SelfServeError('Complete the security check before uploading the CSV.', 400);
  }

  const formData = new FormData();
  formData.append('secret', requireTurnstileSecret(input.env));
  formData.append('response', input.token);
  if (input.remoteIp) {
    formData.append('remoteip', input.remoteIp);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; action?: string; 'error-codes'?: string[] }
    | null;

  if (!response.ok || !payload?.success) {
    throw new SelfServeError('Security check failed. Refresh the page and try again.', 403);
  }

  if (payload.action && payload.action !== 'turnstile-spin-v1') {
    throw new SelfServeError('Security check action did not match this form.', 403);
  }
}

function randomHex(bytesLength = 18) {
  const bytes = new Uint8Array(bytesLength);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createJobId() {
  return `job_${Date.now().toString(36)}_${randomHex(8)}`;
}

export function createAccessToken() {
  return randomHex(24);
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token)
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function hasIssuedRecoveryToken(
  db: D1DatabaseBinding | undefined,
  jobId: string,
  tokenHash: string
) {
  if (!db) {
    return false;
  }

  const token = await db
    .prepare(
      `SELECT job_id
       FROM self_serve_job_recovery_tokens
       WHERE job_id = ?
         AND token_hash = ?
         AND expires_at > ?
       LIMIT 1`
    )
    .bind(jobId, tokenHash, new Date().toISOString())
    .first<{ job_id: string }>();

  return Boolean(token);
}

export async function verifyJobToken(
  job: SelfServeJobRow,
  token: string,
  db?: D1DatabaseBinding
) {
  if (!token) {
    throw new SelfServeError('Missing job token.', 401);
  }

  const tokenHash = await hashToken(token);
  const hasOriginalToken = timingSafeHexEqual(tokenHash, job.token_hash);
  const recoveryExpiresAt = job.recovery_token_expires_at
    ? Date.parse(job.recovery_token_expires_at)
    : Number.NaN;
  const hasRecoveryToken =
    Boolean(job.recovery_token_hash) &&
    Number.isFinite(recoveryExpiresAt) &&
    recoveryExpiresAt > Date.now() &&
    timingSafeHexEqual(tokenHash, job.recovery_token_hash ?? '');
  const hasIssuedToken = await hasIssuedRecoveryToken(db, job.id, tokenHash);

  if (!hasOriginalToken && !hasRecoveryToken && !hasIssuedToken) {
    throw new SelfServeError('Invalid job token.', 403);
  }
}

export async function putCsvObject(
  uploads: R2BucketBinding,
  key: string,
  csv: string
) {
  await uploads.put(key, csv, {
    httpMetadata: {
      contentType: 'text/csv; charset=utf-8',
    },
  });
}

export async function recordSelfServeEvent(
  db: D1DatabaseBinding,
  jobId: string,
  eventName: SelfServeFunnelEvent,
  eventData: Record<string, string | number | boolean | null> = {}
) {
  try {
    await db
      .prepare(
        `INSERT INTO self_serve_events (
          id,
          job_id,
          event_name,
          event_data_json,
          created_at
        ) VALUES (?, ?, ?, ?, ?)`
      )
      .bind(
        crypto.randomUUID(),
        jobId,
        eventName,
        JSON.stringify(eventData),
        new Date().toISOString()
      )
      .run();
  } catch (error) {
    // Analytics must never block a payment, recovery, or download.
    console.error('Unable to record ImageSEOFix funnel event.', {
      jobId,
      eventName,
      error: error instanceof Error ? error.message : 'unknown',
    });
  }
}

export async function insertJob(db: D1DatabaseBinding, input: CreateJobInput) {
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO self_serve_jobs (
        id,
        email,
        store_url,
        original_key,
        cleaned_key,
        token_hash,
        status,
        payment_status,
        processed_image_rows,
        changed_rows,
        issue_rows,
        total_image_rows,
        detected_products,
        warnings_json,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'ready', 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.id,
      input.email,
      input.storeUrl || null,
      input.originalKey,
      input.cleanedKey,
      input.tokenHash,
      input.stats.processedImageRows,
      input.stats.changedRows,
      input.stats.issueRows,
      input.stats.totalImageRows,
      input.stats.detectedProducts,
      JSON.stringify(input.stats.warnings),
      now,
      now
    )
    .run();
}

export async function getJob(db: D1DatabaseBinding, id: string) {
  const job = await db
    .prepare('SELECT * FROM self_serve_jobs WHERE id = ?')
    .bind(id)
    .first<SelfServeJobRow>();

  if (!job) {
    throw new SelfServeError('Job not found.', 404);
  }

  return job;
}

export async function updateCheckoutSession(
  db: D1DatabaseBinding,
  jobId: string,
  checkoutSessionId: string
) {
  await db
    .prepare(
      `UPDATE self_serve_jobs
       SET checkout_session_id = ?, updated_at = ?
       WHERE id = ?`
    )
    .bind(checkoutSessionId, new Date().toISOString(), jobId)
    .run();
}

export async function markJobPaid(
  db: D1DatabaseBinding,
  jobId: string,
  checkoutSessionId: string
) {
  const now = new Date().toISOString();
  const result = await db
    .prepare(
      `UPDATE self_serve_jobs
       SET payment_status = 'paid',
           checkout_session_id = ?,
           paid_at = COALESCE(paid_at, ?),
           updated_at = ?
       WHERE id = ? AND payment_status != 'paid'`
    )
    .bind(checkoutSessionId, now, now, jobId)
    .run();

  return result.meta?.changes === 1;
}

export async function markJobDownloaded(db: D1DatabaseBinding, jobId: string) {
  const now = new Date().toISOString();

  await db
    .prepare(
      `UPDATE self_serve_jobs
       SET first_downloaded_at = COALESCE(first_downloaded_at, ?),
           download_count = download_count + 1,
           updated_at = ?
       WHERE id = ?`
    )
    .bind(now, now, jobId)
    .run();
}

export async function saveImportFeedback(
  db: D1DatabaseBinding,
  jobId: string,
  status: 'success' | 'issue' | 'not_imported',
  feedback: string
) {
  const now = new Date().toISOString();

  await db
    .prepare(
      `UPDATE self_serve_jobs
       SET import_status = ?,
           import_feedback = ?,
           import_reported_at = ?,
           updated_at = ?
       WHERE id = ?`
    )
    .bind(status, feedback, now, now, jobId)
    .run();
}

function recoveryTokenExpiresAt() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
}

export async function issueJobRecoveryLink(input: {
  db: D1DatabaseBinding;
  env: SelfServeEnv;
  job: SelfServeJobRow;
}) {
  const token = createAccessToken();
  const tokenHash = await hashToken(token);
  const expiresAt = recoveryTokenExpiresAt();
  const now = new Date().toISOString();

  await input.db
    .prepare(
      `UPDATE self_serve_jobs
       SET recovery_token_hash = ?,
           recovery_token_expires_at = ?,
           updated_at = ?
       WHERE id = ?`
    )
    .bind(tokenHash, expiresAt, now, input.job.id)
    .run();

  await input.db
    .prepare(
      `DELETE FROM self_serve_job_recovery_tokens
       WHERE job_id = ? AND expires_at <= ?`
    )
    .bind(input.job.id, now)
    .run();

  await input.db
    .prepare(
      `INSERT INTO self_serve_job_recovery_tokens (
        job_id,
        token_hash,
        expires_at,
        created_at
      ) VALUES (?, ?, ?, ?)`
    )
    .bind(input.job.id, tokenHash, expiresAt, now)
    .run();

  const url = new URL('/self-serve', publicSiteUrl(input.env));
  url.searchParams.set('job', input.job.id);
  url.searchParams.set('token', token);

  return { url: url.toString(), expiresAt };
}

type EmailDeliveryConfig =
  | { provider: 'cloudflare'; from: string; email: NonNullable<SelfServeEnv['EMAIL']> }
  | { provider: 'brevo'; apiKey: string; from: string }
  | { provider: 'mailjet'; apiKey: string; apiSecret: string; from: string }
  | { provider: 'resend'; apiKey: string; from: string };

function emailDeliveryConfig(env: SelfServeEnv): EmailDeliveryConfig | null {
  const provider = (env.EMAIL_PROVIDER || process.env.EMAIL_PROVIDER || '').trim().toLowerCase();
  const cloudflareFrom = env.CLOUDFLARE_EMAIL_FROM || process.env.CLOUDFLARE_EMAIL_FROM;
  const brevoApiKey = env.BREVO_API_KEY || process.env.BREVO_API_KEY;
  const brevoFrom = env.BREVO_FROM_EMAIL || process.env.BREVO_FROM_EMAIL;
  const mailjetApiKey = env.MAILJET_API_KEY || process.env.MAILJET_API_KEY;
  const mailjetApiSecret = env.MAILJET_API_SECRET || process.env.MAILJET_API_SECRET;
  const mailjetFrom = env.MAILJET_FROM_EMAIL || process.env.MAILJET_FROM_EMAIL;
  const resendApiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const resendFrom = env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;

  if (provider === 'cloudflare') {
    return env.EMAIL && cloudflareFrom
      ? { provider: 'cloudflare', email: env.EMAIL, from: cloudflareFrom }
      : null;
  }

  if (provider === 'brevo') {
    return brevoApiKey && brevoFrom
      ? { provider: 'brevo', apiKey: brevoApiKey, from: brevoFrom }
      : null;
  }

  if (provider === 'resend') {
    return resendApiKey && resendFrom
      ? { provider: 'resend', apiKey: resendApiKey, from: resendFrom }
      : null;
  }

  if (provider === 'mailjet') {
    return mailjetApiKey && mailjetApiSecret && mailjetFrom
      ? {
          provider: 'mailjet',
          apiKey: mailjetApiKey,
          apiSecret: mailjetApiSecret,
          from: mailjetFrom,
        }
      : null;
  }

  // Keep existing deployments working while allowing a new provider to opt in explicitly.
  if (resendApiKey && resendFrom) {
    return { provider: 'resend', apiKey: resendApiKey, from: resendFrom };
  }
  if (brevoApiKey && brevoFrom) {
    return { provider: 'brevo', apiKey: brevoApiKey, from: brevoFrom };
  }
  if (mailjetApiKey && mailjetApiSecret && mailjetFrom) {
    return {
      provider: 'mailjet',
      apiKey: mailjetApiKey,
      apiSecret: mailjetApiSecret,
      from: mailjetFrom,
    };
  }
  if (env.EMAIL && cloudflareFrom) {
    return { provider: 'cloudflare', email: env.EMAIL, from: cloudflareFrom };
  }
  return null;
}

export function hasEmailDeliveryConfig(env: SelfServeEnv) {
  return Boolean(emailDeliveryConfig(env));
}

function brevoSender(from: string) {
  const match = from.trim().match(/^(.*?)\s*<([^<>\s]+@[^<>\s]+)>$/);
  if (match) {
    const name = match[1].trim().replace(/^['\"]|['\"]$/g, '');
    return name ? { email: match[2], name } : { email: match[2] };
  }
  return { email: from.trim() };
}

function mailjetSender(from: string) {
  const sender = brevoSender(from);
  return sender.name
    ? { Email: sender.email, Name: sender.name }
    : { Email: sender.email };
}

function cloudflareSender(from: string): string | { email: string; name: string } {
  const sender = brevoSender(from);
  return sender.name ? { email: sender.email, name: sender.name } : sender.email;
}

function emailHtml(input: { accessUrl: string; expires: string; jobId: string; purpose: 'paid_delivery' | 'recovery' }) {
  const escapedUrl = input.accessUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const escapedJobId = input.jobId.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const headline =
    input.purpose === 'paid_delivery'
      ? 'Your cleaned Shopify Products CSV is ready.'
      : 'Your secure ImageSEOFix job link is ready.';

  return `<p>${headline}</p><p><a href="${escapedUrl}">Open your secure job</a></p><p>This link expires ${input.expires} UTC. Do not forward it.</p><p>Review Shopify import preview before the final import and keep your original CSV backup.</p><p>Job ID: ${escapedJobId}</p>`;
}

async function providerAcceptedEmail(input: {
  provider: EmailDeliveryConfig['provider'];
  response: Response;
}) {
  if (!input.response.ok) {
    return false;
  }
  if (input.provider !== 'mailjet') {
    return true;
  }

  const payload = (await input.response.json().catch(() => null)) as
    | { Messages?: Array<{ Status?: string }> }
    | null;
  return Boolean(
    payload?.Messages?.length &&
      payload.Messages.every((message) => message.Status?.toLowerCase() === 'success')
  );
}

export async function sendJobAccessEmail(input: {
  env: SelfServeEnv;
  job: SelfServeJobRow;
  accessUrl: string;
  expiresAt: string;
  purpose: 'paid_delivery' | 'recovery';
}) {
  const config = emailDeliveryConfig(input.env);
  if (!config) {
    console.warn(
      JSON.stringify({
        source: 'imageseofix-email',
        event: 'email_skipped_missing_config',
        purpose: input.purpose,
      })
    );
    return false;
  }

  const subject =
    input.purpose === 'paid_delivery'
      ? 'Your ImageSEOFix cleaned CSV is ready'
      : 'Your ImageSEOFix secure job link';
  const expires = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(input.expiresAt));
  const text = [
    input.purpose === 'paid_delivery'
      ? 'Payment confirmed. Your cleaned Shopify Products CSV is ready to download.'
      : 'Use this secure link to reopen your ImageSEOFix CSV cleanup job.',
    '',
    input.accessUrl,
    '',
    `This link expires ${expires} UTC. Do not forward it.`,
    'Review Shopify import preview before the final import and keep your original CSV backup.',
    '',
    `Job ID: ${input.job.id}`,
  ].join('\n');
  const html = emailHtml({
    accessUrl: input.accessUrl,
    expires,
    jobId: input.job.id,
    purpose: input.purpose,
  });

  try {
    if (config.provider === 'cloudflare') {
      await config.email.send({
        to: input.job.email,
        from: cloudflareSender(config.from),
        subject,
        html,
        text,
      });
      return true;
    }

    const response = await fetch(
      config.provider === 'brevo'
        ? 'https://api.brevo.com/v3/smtp/email'
        : config.provider === 'mailjet'
          ? 'https://api.mailjet.com/v3.1/send'
          : 'https://api.resend.com/emails',
      {
        method: 'POST',
        headers:
          config.provider === 'brevo'
            ? {
                Accept: 'application/json',
                'api-key': config.apiKey,
                'Content-Type': 'application/json',
              }
            : config.provider === 'mailjet'
              ? {
                  Accept: 'application/json',
                  Authorization: `Basic ${btoa(`${config.apiKey}:${config.apiSecret}`)}`,
                  'Content-Type': 'application/json',
                }
            : {
                Authorization: `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
              },
        body: JSON.stringify(
          config.provider === 'brevo'
            ? {
                sender: brevoSender(config.from),
                to: [{ email: input.job.email }],
                subject,
                textContent: text,
                tags: ['imageseofix', input.purpose],
              }
            : config.provider === 'mailjet'
              ? {
                  Messages: [
                    {
                      From: mailjetSender(config.from),
                      To: [{ Email: input.job.email }],
                      Subject: subject,
                      TextPart: text,
                      CustomCampaign: `imageseofix-${input.purpose}`,
                    },
                  ],
                }
            : {
                from: config.from,
                to: [input.job.email],
                subject,
                text,
              }
        ),
      }
    );

    if (!(await providerAcceptedEmail({ provider: config.provider, response }))) {
      console.error(
        JSON.stringify({
          source: 'imageseofix-email',
          event: 'email_send_failed',
          provider: config.provider,
          purpose: input.purpose,
          status: response.status,
          responseAccepted: response.ok,
        })
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      JSON.stringify({
        source: 'imageseofix-email',
        event: 'email_send_threw',
        provider: config.provider,
        purpose: input.purpose,
        error: error instanceof Error ? error.name : 'unknown',
      })
    );
    return false;
  }
}

export async function sendPaidDeliveryEmail(input: {
  db: D1DatabaseBinding;
  env: SelfServeEnv;
  job: SelfServeJobRow;
}) {
  if (!hasEmailDeliveryConfig(input.env)) {
    console.warn(
      JSON.stringify({
        source: 'imageseofix-email',
        event: 'paid_delivery_email_skipped_missing_config',
      })
    );
    return false;
  }

  const link = await issueJobRecoveryLink(input);
  return sendJobAccessEmail({
    env: input.env,
    job: input.job,
    accessUrl: link.url,
    expiresAt: link.expiresAt,
    purpose: 'paid_delivery',
  });
}

export async function getLatestJobByEmail(db: D1DatabaseBinding, email: string) {
  return db
    .prepare('SELECT * FROM self_serve_jobs WHERE email = ? ORDER BY created_at DESC LIMIT 1')
    .bind(email)
    .first<SelfServeJobRow>();
}

function requireStripeSecret(env: SelfServeEnv) {
  const secret = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new SelfServeConfigError(
      'Stripe is not configured yet. Add STRIPE_SECRET_KEY before enabling self-serve checkout.'
    );
  }
  return secret;
}

function stripeLivemodeFromSecret(env: SelfServeEnv) {
  const secret = requireStripeSecret(env);
  if (/^(sk|rk)_live_/.test(secret)) {
    return true;
  }
  if (/^(sk|rk)_test_/.test(secret)) {
    return false;
  }
  throw new SelfServeConfigError(
    'Stripe key mode could not be verified. Use a live or test Stripe secret key.'
  );
}

function requireStripeWebhookSecret(env: SelfServeEnv) {
  const secret = env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new SelfServeConfigError(
      'Stripe webhook signing secret is not configured yet. Add STRIPE_WEBHOOK_SECRET before enabling automated fulfillment.'
    );
  }
  return secret;
}

function parseStripeSignatureHeader(signatureHeader: string) {
  const parts = signatureHeader.split(',');
  const timestamp = parts
    .map((part) => part.trim().split('='))
    .find(([key]) => key === 't')?.[1];
  const signatures = parts
    .map((part) => part.trim().split('='))
    .filter(([key, value]) => key === 'v1' && Boolean(value))
    .map(([, value]) => value);

  return { timestamp, signatures };
}

function hexToBytes(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }
  return bytes;
}

function timingSafeHexEqual(left: string, right: string) {
  const leftBytes = hexToBytes(left);
  const rightBytes = hexToBytes(right);
  if (!leftBytes || !rightBytes || leftBytes.length !== rightBytes.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index];
  }
  return diff === 0;
}

async function hmacSha256Hex(secret: string, payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));

  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyStripeWebhookSignature(input: {
  env: SelfServeEnv;
  rawBody: string;
  signatureHeader: string | null;
  toleranceSeconds?: number;
}) {
  if (!input.signatureHeader) {
    throw new SelfServeError('Missing Stripe webhook signature.', 400);
  }

  const { timestamp, signatures } = parseStripeSignatureHeader(input.signatureHeader);
  if (!timestamp || signatures.length === 0) {
    throw new SelfServeError('Invalid Stripe webhook signature.', 400);
  }

  const timestampNumber = Number(timestamp);
  const tolerance = input.toleranceSeconds ?? 300;
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestampNumber) || Math.abs(now - timestampNumber) > tolerance) {
    throw new SelfServeError('Expired Stripe webhook signature.', 400);
  }

  const expectedSignature = await hmacSha256Hex(
    requireStripeWebhookSecret(input.env),
    `${timestamp}.${input.rawBody}`
  );
  const isValid = signatures.some((signature) =>
    timingSafeHexEqual(signature, expectedSignature)
  );

  if (!isValid) {
    throw new SelfServeError('Invalid Stripe webhook signature.', 400);
  }
}

async function parseStripeResponse(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; id?: string; url?: string }
    | null;

  if (!response.ok) {
    throw new SelfServeError(
      payload?.error?.message || 'Stripe returned an error.',
      response.status >= 500 ? 502 : response.status
    );
  }

  return payload;
}

function normalizedConfiguredEmail(value: string | undefined) {
  return value?.trim().toLowerCase() || '';
}

function isInternalE2EJob(env: SelfServeEnv, job: SelfServeJobRow) {
  const configuredEmail = normalizedConfiguredEmail(
    env.IMAGESEOFIX_E2E_EMAIL || process.env.IMAGESEOFIX_E2E_EMAIL
  );
  const promotionCode =
    env.STRIPE_E2E_PROMOTION_CODE || process.env.STRIPE_E2E_PROMOTION_CODE;

  return Boolean(
    configuredEmail &&
      promotionCode &&
      job.email.trim().toLowerCase() === configuredEmail
  );
}

function isExpectedCheckoutAmount(input: {
  env: SelfServeEnv;
  job: SelfServeJobRow;
  session: StripeCheckoutSession;
  paymentRequired: boolean;
}) {
  const { env, job, session, paymentRequired } = input;
  if (session.amount_total === 1900) {
    return true;
  }

  return (
    isInternalE2EJob(env, job) &&
    session.metadata?.e2e === 'true' &&
    session.amount_total === 0 &&
    session.total_details?.amount_discount === 1900 &&
    (!paymentRequired || session.payment_status === 'paid')
  );
}

export async function createCheckoutSession(input: {
  env: SelfServeEnv;
  request: Request;
  job: SelfServeJobRow;
  token: string;
}) {
  const secret = requireStripeSecret(input.env);
  const siteUrl = publicSiteUrl(input.env, input.request);
  const successUrl = `${siteUrl}/self-serve?job=${encodeURIComponent(
    input.job.id
  )}&token=${encodeURIComponent(
    input.token
  )}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}/self-serve?job=${encodeURIComponent(
    input.job.id
  )}&token=${encodeURIComponent(input.token)}`;
  const body = new URLSearchParams({
    mode: 'payment',
    client_reference_id: input.job.id,
    customer_email: input.job.email,
    success_url: successUrl,
    cancel_url: cancelUrl,
    'metadata[job_id]': input.job.id,
    'metadata[product]': 'imageseofix_self_serve_csv_v1',
  });

  if (isInternalE2EJob(input.env, input.job)) {
    body.set('metadata[e2e]', 'true');
    body.set(
      'discounts[0][promotion_code]',
      input.env.STRIPE_E2E_PROMOTION_CODE || process.env.STRIPE_E2E_PROMOTION_CODE || ''
    );
  }

  const priceId = input.env.STRIPE_STARTER_PRICE_ID || process.env.STRIPE_STARTER_PRICE_ID;
  if (priceId) {
    body.set('line_items[0][price]', priceId);
    body.set('line_items[0][quantity]', '1');
  } else {
    body.set('line_items[0][price_data][currency]', 'usd');
    body.set('line_items[0][price_data][unit_amount]', '1900');
    body.set(
      'line_items[0][price_data][product_data][name]',
      'ImageSEOFix Starter CSV cleanup'
    );
    body.set(
      'line_items[0][price_data][product_data][description]',
      'Unlock the cleaned Shopify Products CSV for up to 100 product image rows.'
    );
    body.set('line_items[0][quantity]', '1');
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2026-02-25.clover',
    },
    body,
  });
  const payload = (await parseStripeResponse(response)) as StripeCheckoutSession;

  if (!payload.id || !payload.url) {
    throw new SelfServeError('Stripe did not return a checkout URL.', 502);
  }

  return payload;
}

export async function retrieveCheckoutSession(
  env: SelfServeEnv,
  sessionId: string
) {
  const secret = requireStripeSecret(env);
  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Stripe-Version': '2026-02-25.clover',
      },
    }
  );

  return (await parseStripeResponse(response)) as StripeCheckoutSession;
}

export function isExpectedPaidCheckoutSession(input: {
  env: SelfServeEnv;
  job: SelfServeJobRow;
  session: StripeCheckoutSession;
}) {
  const { job, session } = input;

  return (
    session.client_reference_id === job.id &&
    session.metadata?.job_id === job.id &&
    session.metadata?.product === 'imageseofix_self_serve_csv_v1' &&
    session.mode === 'payment' &&
    session.payment_status === 'paid' &&
    isExpectedCheckoutAmount({
      env: input.env,
      job,
      session,
      paymentRequired: true,
    }) &&
    session.currency?.toLowerCase() === 'usd' &&
    session.livemode === stripeLivemodeFromSecret(input.env)
  );
}

export function isReusableCheckoutSession(input: {
  env: SelfServeEnv;
  job: SelfServeJobRow;
  session: StripeCheckoutSession;
}) {
  const { job, session } = input;

  return (
    session.status === 'open' &&
    Boolean(session.url) &&
    session.client_reference_id === job.id &&
    session.metadata?.job_id === job.id &&
    session.metadata?.product === 'imageseofix_self_serve_csv_v1' &&
    session.mode === 'payment' &&
    isExpectedCheckoutAmount({
      env: input.env,
      job,
      session,
      paymentRequired: false,
    }) &&
    session.currency?.toLowerCase() === 'usd' &&
    session.livemode === stripeLivemodeFromSecret(input.env)
  );
}

export async function markPaidFromStripeSession(input: {
  db: D1DatabaseBinding;
  env: SelfServeEnv;
  job: SelfServeJobRow;
  sessionId: string;
}) {
  if (input.job.payment_status === 'paid') {
    return true;
  }

  const session = await retrieveCheckoutSession(input.env, input.sessionId);
  if (
    session.id === input.sessionId &&
    isExpectedPaidCheckoutSession({
      env: input.env,
      job: input.job,
      session,
    })
  ) {
    const marked = await markJobPaid(input.db, input.job.id, session.id);
    if (marked) {
      await recordSelfServeEvent(input.db, input.job.id, 'payment_verified', {
        amountTotal: session.amount_total ?? null,
        e2e: session.metadata?.e2e === 'true',
      });
      console.log(
        JSON.stringify({
          source: 'imageseofix-event',
          event: 'self_serve_payment_succeeded',
          payload: {
            processedImageRows: input.job.processed_image_rows,
            changedRows: input.job.changed_rows,
          },
          ts: new Date().toISOString(),
        })
      );
      await sendPaidDeliveryEmail({
        db: input.db,
        env: input.env,
        job: input.job,
      });
    }
    return true;
  }

  return false;
}
