import { CsvValidationError, processShopifyCsv } from '@/lib/self-serve/csv';
import {
  assertSelfServeEnabled,
  createAccessToken,
  createJobId,
  getSelfServeBindings,
  hashToken,
  insertJob,
  jsonError,
  putCsvObject,
  requestIp,
  SelfServeError,
  verifyTurnstileToken,
} from '@/lib/self-serve/server';

export const dynamic = 'force-dynamic';

const maxCsvBytes = 2_000_000;
const maxUploadRequestBytes = maxCsvBytes + 100_000;

function normalizeEmail(value: unknown) {
  if (typeof value !== 'string') {
    throw new CsvValidationError('Enter a valid email before uploading the CSV.');
  }

  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    throw new CsvValidationError('Enter a valid email before uploading the CSV.');
  }

  return email;
}

function normalizeStoreUrl(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  const storeUrl = value.trim();
  if (!storeUrl) {
    return '';
  }
  if (storeUrl.length > 300) {
    throw new CsvValidationError('Store URL is too long.');
  }

  return storeUrl;
}

function normalizeCsv(value: unknown) {
  if (typeof value !== 'string') {
    throw new CsvValidationError('Upload a Shopify Products CSV file.');
  }

  const csv = value.trim();
  if (!csv) {
    throw new CsvValidationError('The CSV file is empty.');
  }
  if (new TextEncoder().encode(csv).byteLength > maxCsvBytes) {
    throw new CsvValidationError('The CSV is larger than the 2 MB self-serve beta limit.');
  }

  return csv;
}

function normalizeTurnstileToken(value: unknown) {
  if (typeof value !== 'string') {
    throw new SelfServeError('Complete the security check before uploading the CSV.', 400);
  }

  const token = value.trim();
  if (!token || token.length > 4096) {
    throw new SelfServeError('Complete the security check before uploading the CSV.', 400);
  }

  return token;
}

function rejectOversizedRequest(request: Request) {
  const contentLength = request.headers.get('content-length');
  if (!contentLength) {
    return;
  }

  const bytes = Number(contentLength);
  if (Number.isFinite(bytes) && bytes > maxUploadRequestBytes) {
    throw new CsvValidationError(
      'The upload request is larger than the 2 MB self-serve beta limit.'
    );
  }
}

export async function POST(request: Request) {
  try {
    const { db, uploads, env } = await getSelfServeBindings();

    assertSelfServeEnabled(env);
    rejectOversizedRequest(request);

    const body = (await request.json()) as {
      email?: unknown;
      storeUrl?: unknown;
      csv?: unknown;
      turnstileToken?: unknown;
    };
    const email = normalizeEmail(body?.email);
    const storeUrl = normalizeStoreUrl(body?.storeUrl);
    const csv = normalizeCsv(body?.csv);
    const turnstileToken = normalizeTurnstileToken(body?.turnstileToken);

    await verifyTurnstileToken({
      env,
      token: turnstileToken,
      remoteIp: requestIp(request),
    });

    const result = processShopifyCsv(csv, 100);
    const jobId = createJobId();
    const token = createAccessToken();
    const tokenHash = await hashToken(token);
    const originalKey = `self-serve/${jobId}/original.csv`;
    const cleanedKey = `self-serve/${jobId}/cleaned.csv`;

    await putCsvObject(uploads, originalKey, csv);
    await putCsvObject(uploads, cleanedKey, result.cleanedCsv);
    await insertJob(db, {
      id: jobId,
      email,
      storeUrl,
      originalKey,
      cleanedKey,
      tokenHash,
      stats: result.stats,
    });

    return Response.json(
      {
        jobId,
        token,
        stats: result.stats,
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
      return jsonError(new CsvValidationError('Invalid JSON request body.'));
    }
    return jsonError(error);
  }
}
