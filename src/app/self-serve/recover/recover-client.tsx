'use client';

import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { CheckCircle2, Loader2, Mail, ShieldCheck } from 'lucide-react';
import Script from 'next/script';
import { type FormEvent, useEffect, useRef, useState } from 'react';

type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId?: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '';

async function readError(response: Response) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || 'Unable to send a secure link. Try again in a moment.';
}

export function RecoverClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!turnstileSiteKey || !isReady || !containerRef.current || widgetIdRef.current || !window.turnstile) {
      return;
    }

    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: turnstileSiteKey,
      action: 'turnstile-spin-v1',
      callback: setToken,
      'expired-callback': () => setToken(''),
      'error-callback': () => setToken(''),
    });
    widgetIdRef.current = widgetId;

    return () => {
      window.turnstile?.remove?.(widgetId);
      widgetIdRef.current = null;
    };
  }, [isReady]);

  function resetTurnstile() {
    setToken('');
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError('Complete the security check before requesting a link.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/self-serve/recover', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: token }),
      });
      if (!response.ok) {
        throw new Error(await readError(response));
      }

      trackEvent('self_serve_recovery_requested');
      setMessage('If a matching cleanup job exists, a secure link is on its way. Check your inbox and spam folder.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to send a secure link.');
    } finally {
      resetTurnstile();
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl items-center px-4 py-12 md:px-6">
      <section className="w-full rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Mail className="size-5" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-normal">Recover your cleanup job</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Enter the email used at checkout. We&apos;ll send a short-lived secure link if we find a matching ImageSEOFix job.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-1.5 text-sm font-medium">
            Checkout email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              placeholder="you@store.com"
              className="h-11 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </label>

          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onLoad={() => setIsReady(true)}
          />
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 text-primary" />
              Security check
            </div>
            {turnstileSiteKey ? (
              <div ref={containerRef} className="mt-3 min-h-[65px]" />
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Recovery email is being configured. Contact support for help.</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting || !turnstileSiteKey || !token}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            Send secure link
          </Button>
        </form>

        {message ? (
          <div className="mt-5 flex gap-2 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm leading-6 text-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            {message}
          </div>
        ) : null}
        {error ? <p className="mt-5 text-sm leading-6 text-destructive">{error}</p> : null}
      </section>
    </main>
  );
}
