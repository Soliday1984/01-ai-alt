import { NextResponse } from 'next/server';

const allowedEvents = new Set([
  'csv_export',
  'csv_generate',
  'csv_upload',
  'hero_scan_click',
  'lead_request_missing_email',
  'lead_request_submit',
  'pricing_cta_click',
  'pricing_view',
  'smoke_test',
  'store_scan_error',
  'store_scan_submit',
  'store_scan_success',
]);
const maxBodyBytes = 2_000;

type EventPayload = Record<string, string | number | boolean | null>;

function noContent() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function jsonResponse(body: unknown, status = 400) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function sanitizePayload(input: unknown): EventPayload {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const payload: EventPayload = {};
  for (const [key, value] of Object.entries(input)) {
    if (!/^[a-zA-Z0-9_]{1,40}$/.test(key)) {
      continue;
    }

    if (
      value === null ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      payload[key] = value;
      continue;
    }

    if (typeof value === 'string') {
      payload[key] = value.slice(0, 120);
    }
  }

  return payload;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (rawBody.length > maxBodyBytes) {
    return jsonResponse({ error: 'Event payload is too large.' }, 413);
  }

  let body: unknown;
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return jsonResponse({ error: 'Invalid event payload.' }, 400);
  }

  const event =
    body && typeof body === 'object' && !Array.isArray(body)
      ? String((body as { event?: unknown }).event ?? '')
      : '';

  if (!allowedEvents.has(event)) {
    return jsonResponse({ error: 'Unknown event.' }, 400);
  }

  const payload = sanitizePayload(
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as { payload?: unknown }).payload
      : undefined
  );

  console.log(
    JSON.stringify({
      source: 'imageseofix-event',
      event,
      payload,
      ts: new Date().toISOString(),
    })
  );

  return noContent();
}
