'use client';

import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Download,
  FileSpreadsheet,
  Loader2,
  Lock,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
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

type JobStats = {
  totalRows: number;
  totalImageRows: number;
  processedImageRows: number;
  changedRows: number;
  issueRows: number;
  detectedProducts: number;
  warnings: string[];
};

type CreatedJob = {
  jobId: string;
  token: string;
  stats: JobStats;
};

type JobStatus = {
  job: {
    id: string;
    email: string;
    storeUrl: string | null;
    status: string;
    paymentStatus: string;
    processedImageRows: number;
    changedRows: number;
    issueRows: number;
    totalImageRows: number;
    detectedProducts: number;
    warnings: string[];
    createdAt: string;
    paidAt: string | null;
  };
  canDownload: boolean;
  downloadUrl: string | null;
};

const starterPrice = '$19';
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '';

const steps = [
  'Export the full Products CSV from Shopify Admin.',
  'Upload it here with your email and store URL.',
  `Pay ${starterPrice} to unlock the cleaned CSV for up to 100 image rows.`,
  'Review Shopify import preview before clicking the final import button.',
];

async function readError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  return payload?.error || 'Request failed. Try again in a moment.';
}

function mergeStatsFromStatus(status: JobStatus): JobStats {
  return {
    totalRows: 0,
    totalImageRows: status.job.totalImageRows,
    processedImageRows: status.job.processedImageRows,
    changedRows: status.job.changedRows,
    issueRows: status.job.issueRows,
    detectedProducts: status.job.detectedProducts,
    warnings: status.job.warnings,
  };
}

export function SelfServeClient() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const [email, setEmail] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [csv, setCsv] = useState('');
  const [fileName, setFileName] = useState('');
  const [createdJob, setCreatedJob] = useState<CreatedJob | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isTurnstileReady, setIsTurnstileReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  const stats = jobStatus
    ? mergeStatsFromStatus(jobStatus)
    : (createdJob?.stats ?? null);

  useEffect(() => {
    if (
      !turnstileSiteKey ||
      !isTurnstileReady ||
      !turnstileContainerRef.current ||
      turnstileWidgetIdRef.current ||
      !window.turnstile
    ) {
      return;
    }

    const widgetId = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: turnstileSiteKey,
      action: 'turnstile-spin-v1',
      callback: (token) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
      'error-callback': () => setTurnstileToken(''),
    });

    turnstileWidgetIdRef.current = widgetId;

    return () => {
      if (window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
      }
      turnstileWidgetIdRef.current = null;
    };
  }, [isTurnstileReady]);

  useEffect(() => {
    const job = searchParams.get('job');
    const token = searchParams.get('token');
    const sessionId = searchParams.get('session_id');

    if (!job || !token) {
      return;
    }

    const jobId = job;
    const jobToken = token;

    setCreatedJob({
      jobId,
      token: jobToken,
      stats: {
        totalRows: 0,
        totalImageRows: 0,
        processedImageRows: 0,
        changedRows: 0,
        issueRows: 0,
        detectedProducts: 0,
        warnings: [],
      },
    });

    const controller = new AbortController();

    async function loadStatus() {
      setIsChecking(true);
      setError('');
      try {
        const query = new URLSearchParams({ token: jobToken });
        if (sessionId) {
          query.set('session_id', sessionId);
        }
        const response = await fetch(`/api/self-serve/jobs/${jobId}?${query}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(await readError(response));
        }
        const payload = (await response.json()) as JobStatus;
        setJobStatus(payload);
        trackEvent('self_serve_status_loaded', {
          paid: payload.canDownload,
          jobId,
        });
      } catch (caught) {
        if (controller.signal.aborted) {
          return;
        }
        setError(caught instanceof Error ? caught.message : 'Unable to load this job.');
      } finally {
        if (!controller.signal.aborted) {
          setIsChecking(false);
        }
      }
    }

    void loadStatus();

    return () => controller.abort();
  }, [searchParams]);

  function onFileChange(file?: File) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCsv(String(reader.result ?? ''));
      setFileName(file.name);
      setError('');
      trackEvent('self_serve_csv_selected', {
        bytes: file.size,
      });
    };
    reader.readAsText(file);
  }

  function resetTurnstile() {
    setTurnstileToken('');
    if (turnstileWidgetIdRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }

  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!csv.trim()) {
      setError('Upload the full Shopify Products CSV first.');
      return;
    }

    if (!turnstileSiteKey) {
      setError('Security check is being configured. Try again soon.');
      return;
    }

    if (!turnstileToken) {
      setError('Complete the security check before generating the cleaned CSV.');
      return;
    }

    setIsUploading(true);
    setError('');
    setCreatedJob(null);
    setJobStatus(null);

    try {
      const response = await fetch('/api/self-serve/jobs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          storeUrl,
          csv,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const payload = (await response.json()) as CreatedJob;
      setCreatedJob(payload);
      trackEvent('self_serve_job_created', {
        imageRows: payload.stats.processedImageRows,
        changedRows: payload.stats.changedRows,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to create this cleanup job.'
      );
    } finally {
      resetTurnstile();
      setIsUploading(false);
    }
  }

  async function startCheckout() {
    if (!createdJob) {
      setError('Create a cleanup job before checkout.');
      return;
    }

    setIsPaying(true);
    setError('');

    try {
      const response = await fetch('/api/self-serve/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jobId: createdJob.jobId,
          token: createdJob.token,
        }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const payload = (await response.json()) as {
        checkoutUrl?: string;
      };
      if (!payload.checkoutUrl) {
        throw new Error('Stripe did not return a checkout URL.');
      }

      trackEvent('self_serve_checkout_start', {
        jobId: createdJob.jobId,
      });
      window.location.href = payload.checkoutUrl;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to start checkout.'
      );
      setIsPaying(false);
    }
  }

  function downloadCleanedCsv() {
    if (!jobStatus?.downloadUrl) {
      setError('The cleaned CSV is not unlocked yet.');
      return;
    }

    trackEvent('self_serve_csv_download', {
      jobId: jobStatus.job.id,
    });
    window.location.href = jobStatus.downloadUrl;
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-[0.95fr_1.05fr] md:px-6 lg:px-8">
      <section className="min-w-0">
        <div className="mb-5 flex w-fit items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
          <FileSpreadsheet className="size-4" />
          Self-serve CSV cleanup
        </div>
        <h1 className="text-4xl font-semibold leading-[1.04] tracking-normal md:text-5xl">
          Upload a Shopify Products CSV, pay once, download the cleaned file.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Built for Shopify merchants who want a safe image alt text cleanup
          without installing an app or sharing admin access. ImageSEOFix keeps
          the original CSV shape and only updates Image Alt Text.
        </p>

        <div className="mt-8 grid gap-3">
          {steps.map((step, index) => (
            <div key={step} className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border bg-card p-4">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
          This v1 is intentionally narrow: no Shopify login, no image downloads,
          no AI image model calls. You upload the official CSV, ImageSEOFix
          repairs up to 100 product image rows, then Stripe unlocks the cleaned
          CSV download.
        </div>
      </section>

      <section className="min-w-0 space-y-5">
        <form onSubmit={createJob} className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Upload className="size-4 text-primary" />
            Create cleanup job
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium">
              Work email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@store.com"
                className="h-11 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                required
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Store URL
              <input
                value={storeUrl}
                onChange={(event) => setStoreUrl(event.target.value)}
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://your-store.com"
                className="h-11 rounded-md border bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </label>

            <div className="rounded-lg border border-dashed bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {fileName || 'Official Shopify Products CSV'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Max 2 MB in beta. Keep all option, variant, image, and
                    market columns from the Shopify export.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Choose CSV
                </Button>
              </div>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => onFileChange(event.target.files?.[0])}
              />
            </div>
          </div>

          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onLoad={() => setIsTurnstileReady(true)}
          />

          <div className="mt-5 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 text-primary" />
              Security check
            </div>
            {turnstileSiteKey ? (
              <div ref={turnstileContainerRef} className="mt-3 min-h-[65px]" />
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Security check is being configured. Self-serve uploads are not
                open yet.
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={isUploading || !turnstileSiteKey || !turnstileToken}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="size-4" />
              )}
              Generate cleaned CSV
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              Nothing is written to Shopify. You review the downloaded file
              before importing it.
            </p>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            By uploading, you acknowledge our{' '}
            <a className="font-medium text-primary hover:underline" href="/privacy">
              Privacy Policy
            </a>
            .
          </p>
        </form>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm leading-6 text-destructive">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="size-4" />
              Action needed
            </div>
            <p className="mt-2">{error}</p>
          </div>
        ) : null}

        {stats ? (
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="size-4 text-primary" />
              Cleanup result
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Images processed</p>
                <p className="mt-1 text-2xl font-semibold">
                  {stats.processedImageRows}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Changed rows</p>
                <p className="mt-1 text-2xl font-semibold">{stats.changedRows}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Issue rows</p>
                <p className="mt-1 text-2xl font-semibold">{stats.issueRows}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Products found</p>
                <p className="mt-1 text-2xl font-semibold">
                  {stats.detectedProducts}
                </p>
              </div>
            </div>

            {stats.warnings.length > 0 ? (
              <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm leading-6 text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-amber-900">
                  <AlertTriangle className="size-4" />
                  Review before importing
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {stats.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              {jobStatus?.canDownload ? (
                <Button onClick={downloadCleanedCsv}>
                  <Download className="size-4" />
                  Download cleaned CSV
                </Button>
              ) : (
                <Button onClick={startCheckout} disabled={isPaying || isChecking}>
                  {isPaying || isChecking ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                  Pay {starterPrice} and unlock download
                </Button>
              )}
              <Button asChild variant="outline">
                <a href="/#shopify-csv-workflow">Read import guide</a>
              </Button>
            </div>
            {!jobStatus?.canDownload ? (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                By paying, you agree to the{' '}
                <a className="font-medium text-primary hover:underline" href="/terms">
                  Terms
                </a>
                ,{' '}
                <a className="font-medium text-primary hover:underline" href="/privacy">
                  Privacy Policy
                </a>
                , and{' '}
                <a
                  className="font-medium text-primary hover:underline"
                  href="/refund-policy"
                >
                  Refund Policy
                </a>
                .
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="mt-3 text-base font-semibold">Cost controlled</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              CSV text processing only, capped file size, capped image rows,
              and no expensive model calls in the first paid version.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <Lock className="size-5 text-primary" />
            <h2 className="mt-3 text-base font-semibold">Merchant safe</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ImageSEOFix stores the original and cleaned CSV, then unlocks the
              cleaned version only after Stripe confirms payment.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
