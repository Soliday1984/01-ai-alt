'use client';

type AnalyticsPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const compactPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
  const body = JSON.stringify({ event, payload: compactPayload });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/events', blob);
      return;
    }

    void fetch('/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    // Analytics should never block the user's audit flow.
  }
}
