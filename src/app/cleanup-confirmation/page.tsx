import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Mail,
  ShieldCheck,
} from 'lucide-react';

const leadEmail = process.env.NEXT_PUBLIC_LEAD_EMAIL ?? 'hello@imageseofix.com';

export const metadata: Metadata = {
  title: 'Cleanup Confirmation',
  description:
    'Next steps after reserving an ImageSEOFix Shopify image alt text cleanup.',
  alternates: {
    canonical: '/cleanup-confirmation',
  },
  robots: {
    index: false,
    follow: false,
  },
};

const nextSteps = [
  'Export the full Products CSV from Shopify Admin.',
  'Keep the original export as your backup.',
  'Send the CSV, store URL, and order email to ImageSEOFix.',
  'Review the cleaned CSV before importing it back into Shopify.',
];

export default function CleanupConfirmationPage() {
  const subject = 'ImageSEOFix cleanup CSV upload';
  const body = [
    'Hi ImageSEOFix,',
    '',
    'I reserved a Shopify image alt text cleanup.',
    '',
    'Store URL:',
    'Stripe payment email:',
    'Catalog size:',
    '',
    'I will attach the full Shopify Products CSV export to this email.',
  ].join('\n');

  return (
    <main className="min-h-dvh bg-background">
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-6 lg:px-8">
        <div>
          <div className="mb-5 flex w-fit items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <CheckCircle2 className="size-4" />
            Cleanup slot reserved
          </div>
          <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">
            Send your Shopify CSV so we can prepare the cleaned file.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            ImageSEOFix works from the full Products CSV exported by Shopify. We
            update image alt text while preserving product, option, variant, and
            image columns for a safer import preview.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a
                href={`mailto:${leadEmail}?subject=${encodeURIComponent(
                  subject
                )}&body=${encodeURIComponent(body)}`}
              >
                Email the CSV
                <Mail className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/#tool">
                Back to audit tool
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border bg-card p-5">
            <FileSpreadsheet className="size-5 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">What to send</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {nextSteps.map((step) => (
                <li key={step} className="flex gap-2">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Delivery scope</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Starter cleanup covers up to 100 product images. Larger catalogs
              get a fixed quote before work starts. We do not need Shopify admin
              login, app install, or store write permissions for this manual CSV
              delivery path.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
