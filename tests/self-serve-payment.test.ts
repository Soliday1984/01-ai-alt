import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hashToken,
  markPaidFromStripeSession,
  sendJobAccessEmail,
  verifyJobToken,
  type SelfServeJobRow,
} from '../src/lib/self-serve/server.ts';

function createJob(tokenHash: string): SelfServeJobRow {
  return {
    id: 'job_test_paid',
    email: 'merchant@example.com',
    store_url: 'https://merchant.example.com',
    original_key: 'self-serve/job_test_paid/original.csv',
    cleaned_key: 'self-serve/job_test_paid/cleaned.csv',
    token_hash: tokenHash,
    status: 'ready',
    payment_status: 'unpaid',
    checkout_session_id: 'cs_test_123',
    processed_image_rows: 3,
    changed_rows: 2,
    issue_rows: 2,
    total_image_rows: 3,
    detected_products: 2,
    warnings_json: '[]',
    created_at: '2026-07-16T00:00:00.000Z',
    updated_at: '2026-07-16T00:00:00.000Z',
    paid_at: null,
    first_downloaded_at: null,
    download_count: 0,
    import_status: null,
    import_feedback: null,
    import_reported_at: null,
    recovery_token_hash: null,
    recovery_token_expires_at: null,
  };
}

function createDb(job: SelfServeJobRow) {
  return {
    prepare(query: string) {
      let values: unknown[] = [];
      return {
        bind(...nextValues: unknown[]) {
          values = nextValues;
          return this;
        },
        async first<T>() {
          return job as T;
        },
        async all<T>() {
          return { results: [job] as T[] };
        },
        async run() {
          if (query.includes("SET payment_status = 'paid'")) {
            if (job.payment_status === 'paid') {
              return { meta: { changes: 0 } };
            }
            job.payment_status = 'paid';
            job.checkout_session_id = String(values[0]);
            job.paid_at = String(values[1]);
            job.updated_at = String(values[2]);
            return { meta: { changes: 1 } };
          }

          if (query.includes('SET recovery_token_hash = ?')) {
            job.recovery_token_hash = String(values[0]);
            job.recovery_token_expires_at = String(values[1]);
            job.updated_at = String(values[2]);
            return { meta: { changes: 1 } };
          }

          throw new Error(`Unexpected test SQL: ${query}`);
        },
      };
    },
  };
}

function checkoutSession(amountTotal = 1900) {
  return {
    id: 'cs_test_123',
    client_reference_id: 'job_test_paid',
    metadata: {
      job_id: 'job_test_paid',
      product: 'imageseofix_self_serve_csv_v1',
    },
    mode: 'payment',
    payment_status: 'paid',
    amount_total: amountTotal,
    currency: 'usd',
    livemode: false,
  };
}

test('verified Stripe payment unlocks the job and emails a short-lived recovery link', async (t) => {
  const job = createJob(await hashToken('original-access-token'));
  const db = createDb(job);
  const calls: Array<{ url: string; body?: string }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, body: typeof init?.body === 'string' ? init.body : undefined });
    if (url.includes('/v1/checkout/sessions/')) {
      return new Response(JSON.stringify(checkoutSession()), { status: 200 });
    }
    if (url === 'https://api.brevo.com/v3/smtp/email') {
      return new Response(JSON.stringify({ messageId: '<email_test_123>' }), { status: 201 });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const paid = await markPaidFromStripeSession({
    db,
    env: {
      STRIPE_SECRET_KEY: 'sk_test_example',
      EMAIL_PROVIDER: 'brevo',
      BREVO_API_KEY: 'xkeysib-test-example',
      BREVO_FROM_EMAIL: 'ImageSEOFix <support@example.com>',
      NEXT_PUBLIC_SITE_URL: 'https://imageseofix.example',
    },
    job,
    sessionId: 'cs_test_123',
  });

  assert.equal(paid, true);
  assert.equal(job.payment_status, 'paid');
  assert.ok(job.paid_at);
  assert.ok(job.recovery_token_hash);
  assert.ok(job.recovery_token_expires_at);
  assert.equal(calls.length, 2);

  const email = JSON.parse(calls[1].body ?? '{}') as {
    sender?: { email?: string; name?: string };
    textContent?: string;
  };
  assert.deepEqual(email.sender, { email: 'support@example.com', name: 'ImageSEOFix' });
  const link = email.textContent?.match(/https:\/\/imageseofix\.example\/self-serve\?[^\s]+/)?.[0];
  assert.ok(link);
  const recoveryToken = new URL(link).searchParams.get('token');
  assert.ok(recoveryToken);
  await assert.doesNotReject(() => verifyJobToken(job, recoveryToken));
});

test('Cloudflare Email binding sends a secure recovery link without a third-party API key', async () => {
  const job = createJob(await hashToken('original-access-token'));
  let message: {
    to: string;
    from: { email?: string; name?: string } | string;
    subject: string;
    text: string;
    html: string;
  } | null = null;

  const delivered = await sendJobAccessEmail({
    env: {
      EMAIL_PROVIDER: 'cloudflare',
      CLOUDFLARE_EMAIL_FROM: 'ImageSEOFix <support@imageseofix.com>',
      EMAIL: {
        async send(nextMessage) {
          message = nextMessage;
          return { messageId: 'cf-email-123' };
        },
      },
    } as never,
    job,
    accessUrl: 'https://imageseofix.example/self-serve?job=job_test_paid&token=recovery-token',
    expiresAt: '2026-07-25T00:00:00.000Z',
    purpose: 'paid_delivery',
  });

  assert.equal(delivered, true);
  assert.equal(message?.to, 'merchant@example.com');
  assert.deepEqual(message?.from, { email: 'support@imageseofix.com', name: 'ImageSEOFix' });
  assert.match(message?.text ?? '', /recovery-token/);
  assert.match(message?.html ?? '', /recovery-token/);
});

test('amount mismatch never unlocks a job or triggers delivery email', async (t) => {
  const job = createJob(await hashToken('original-access-token'));
  const db = createDb(job);
  let calls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify(checkoutSession(900)), { status: 200 });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const paid = await markPaidFromStripeSession({
    db,
    env: { STRIPE_SECRET_KEY: 'sk_test_example' },
    job,
    sessionId: 'cs_test_123',
  });

  assert.equal(paid, false);
  assert.equal(job.payment_status, 'unpaid');
  assert.equal(job.recovery_token_hash, null);
  assert.equal(calls, 1);
});

test('explicit Resend configuration remains supported during the Brevo migration', async (t) => {
  const job = createJob(await hashToken('original-access-token'));
  const originalFetch = globalThis.fetch;
  let request: { url: string; authorization: string | null; body?: string } | null = null;
  globalThis.fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    request = {
      url: String(input),
      authorization: headers.get('Authorization'),
      body: typeof init?.body === 'string' ? init.body : undefined,
    };
    return new Response(JSON.stringify({ id: 'email_test_123' }), { status: 200 });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const delivered = await sendJobAccessEmail({
    env: {
      EMAIL_PROVIDER: 'resend',
      RESEND_API_KEY: 're_test_example',
      RESEND_FROM_EMAIL: 'ImageSEOFix <support@example.com>',
    },
    job,
    accessUrl: 'https://imageseofix.example/self-serve?job=job_test_paid&token=recovery-token',
    expiresAt: '2026-07-25T00:00:00.000Z',
    purpose: 'recovery',
  });

  assert.equal(delivered, true);
  assert.equal(request?.url, 'https://api.resend.com/emails');
  assert.equal(request?.authorization, 'Bearer re_test_example');
  assert.match(request?.body ?? '', /recovery-token/);
});

test('explicit Mailjet configuration sends the same secure delivery link', async (t) => {
  const job = createJob(await hashToken('original-access-token'));
  const originalFetch = globalThis.fetch;
  let request: { url: string; authorization: string | null; body?: string } | null = null;
  globalThis.fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    request = {
      url: String(input),
      authorization: headers.get('Authorization'),
      body: typeof init?.body === 'string' ? init.body : undefined,
    };
    return new Response(JSON.stringify({ Messages: [{ Status: 'success' }] }), { status: 200 });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const delivered = await sendJobAccessEmail({
    env: {
      EMAIL_PROVIDER: 'mailjet',
      MAILJET_API_KEY: 'mj_api_key',
      MAILJET_API_SECRET: 'mj_api_secret',
      MAILJET_FROM_EMAIL: 'ImageSEOFix <support@example.com>',
    },
    job,
    accessUrl: 'https://imageseofix.example/self-serve?job=job_test_paid&token=recovery-token',
    expiresAt: '2026-07-25T00:00:00.000Z',
    purpose: 'paid_delivery',
  });

  assert.equal(delivered, true);
  assert.equal(request?.url, 'https://api.mailjet.com/v3.1/send');
  assert.equal(request?.authorization, `Basic ${btoa('mj_api_key:mj_api_secret')}`);
  const email = JSON.parse(request?.body ?? '{}') as {
    Messages?: Array<{ From?: { Email?: string; Name?: string }; TextPart?: string }>;
  };
  assert.deepEqual(email.Messages?.[0]?.From, {
    Email: 'support@example.com',
    Name: 'ImageSEOFix',
  });
  assert.match(email.Messages?.[0]?.TextPart ?? '', /recovery-token/);
});

test('Mailjet per-message rejection is not treated as successful delivery', async (t) => {
  const job = createJob(await hashToken('original-access-token'));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ Messages: [{ Status: 'error' }] }), { status: 200 });
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const delivered = await sendJobAccessEmail({
    env: {
      EMAIL_PROVIDER: 'mailjet',
      MAILJET_API_KEY: 'mj_api_key',
      MAILJET_API_SECRET: 'mj_api_secret',
      MAILJET_FROM_EMAIL: 'ImageSEOFix <support@example.com>',
    },
    job,
    accessUrl: 'https://imageseofix.example/self-serve?job=job_test_paid&token=recovery-token',
    expiresAt: '2026-07-25T00:00:00.000Z',
    purpose: 'paid_delivery',
  });

  assert.equal(delivered, false);
});

test('a verified older checkout session for the same job still unlocks delivery', async (t) => {
  const job = createJob(await hashToken('original-access-token'));
  job.checkout_session_id = 'cs_test_newer_open_session';
  const db = createDb(job);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes('/v1/checkout/sessions/cs_test_123')) {
      return new Response(JSON.stringify(checkoutSession()), { status: 200 });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const paid = await markPaidFromStripeSession({
    db,
    env: { STRIPE_SECRET_KEY: 'sk_test_example' },
    job,
    sessionId: 'cs_test_123',
  });

  assert.equal(paid, true);
  assert.equal(job.payment_status, 'paid');
  assert.equal(job.checkout_session_id, 'cs_test_123');
});
