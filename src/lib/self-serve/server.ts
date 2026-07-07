import { getCloudflareContext } from '@opennextjs/cloudflare';

import type { SelfServeCsvStats } from './csv';

type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>() => Promise<T | null>;
  run: () => Promise<unknown>;
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

type SelfServeEnv = CloudflareEnv & {
  IMAGESEOFIX_DB?: D1DatabaseBinding;
  IMAGESEOFIX_UPLOADS?: R2BucketBinding;
  SELF_SERVE_ENABLED?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_STARTER_PRICE_ID?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_SELF_SERVE_ENABLED?: string;
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
  client_reference_id?: string | null;
  payment_status?: string | null;
};

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

export async function verifyJobToken(job: SelfServeJobRow, token: string) {
  if (!token) {
    throw new SelfServeError('Missing job token.', 401);
  }

  const tokenHash = await hashToken(token);
  if (tokenHash !== job.token_hash) {
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
  await db
    .prepare(
      `UPDATE self_serve_jobs
       SET payment_status = 'paid',
           checkout_session_id = ?,
           paid_at = COALESCE(paid_at, ?),
           updated_at = ?
       WHERE id = ?`
    )
    .bind(checkoutSessionId, now, now, jobId)
    .run();
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
    session.client_reference_id === input.job.id &&
    session.payment_status === 'paid'
  ) {
    await markJobPaid(input.db, input.job.id, session.id);
    return true;
  }

  return false;
}
