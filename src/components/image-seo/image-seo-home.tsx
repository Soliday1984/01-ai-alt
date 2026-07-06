import { ImageSeoAuditor } from '@/components/image-seo/image-seo-auditor';
import { TrackedLink } from '@/components/image-seo/tracked-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Gauge,
  Lock,
  Mail,
  MousePointerClick,
  Search,
  ShoppingBag,
  Store,
  Users,
  WandSparkles,
} from 'lucide-react';

const workflow = [
  {
    icon: Store,
    title: 'Scan a real storefront',
    body: 'Use a public Shopify store URL first. The free scan checks 5 products without asking for app permissions.',
  },
  {
    icon: Gauge,
    title: 'Review weak alt text',
    body: 'See missing, generic, too-short, or shade-only alt text in one table with product-aware repair suggestions.',
  },
  {
    icon: ClipboardCheck,
    title: 'Fix safely in Shopify',
    body: 'Copy a few suggestions manually or export a cleanup CSV after backing up the original Shopify product file.',
  },
];

const bestPracticeSteps = [
  {
    icon: Store,
    title: 'Start with your storefront URL',
    body: 'Paste a real merchant storefront, not shopify.com itself. The scan is read-only and never writes to Shopify.',
  },
  {
    icon: MousePointerClick,
    title: 'Fix a small sample manually',
    body: 'For a few images, copy the suggested alt text, open Shopify Admin > Products, select the product media, edit alt text, and save.',
  },
  {
    icon: Download,
    title: 'Use CSV for batch cleanup',
    body: 'For larger stores, export the full Products CSV from Shopify, keep a backup, upload it here, review suggestions, then import the cleaned copy.',
  },
  {
    icon: Mail,
    title: 'Ask for full-store cleanup',
    body: 'If the sample shows many issues, request a private audit for a Shopify-ready cleanup workflow or human-reviewed CSV.',
  },
];

const csvDeliverySteps = [
  {
    title: 'Export Products CSV',
    body: 'In Shopify Admin, go to Products, export the current full Products CSV, and keep the original file as a backup.',
  },
  {
    title: 'Upload to ImageSEOFix',
    body: 'Upload the Shopify export without deleting option, variant, image, or market columns. The free preview checks the first 5 products.',
  },
  {
    title: 'Review the preview',
    body: 'Check missing, generic, short, or long alt text. Download the preview CSV only when the suggestions look safe.',
  },
  {
    title: 'Request full cleanup',
    body: 'For the full catalog, send the audit summary and CSV. The paid workflow returns a Shopify-ready CSV with Image Alt Text updated.',
  },
  {
    title: 'Import carefully',
    body: 'Import the cleaned copy with matching handles overwrite enabled, review Shopify preview, spot-check products, and keep the backup.',
  },
];

const exampleRows = [
  {
    image: 'foundation-shade-210.png',
    current: '210 light medium',
    fix: 'Haus Labs foundation shade 210 light medium product image',
    status: 'Needs context',
  },
  {
    image: 'linen-shirt-front.jpg',
    current: 'Missing',
    fix: 'Blue linen shirt front product image',
    status: 'Missing alt',
  },
  {
    image: 'walnut-desk-lamp.png',
    current: 'lamp',
    fix: 'Walnut desk lamp with brass shade product image',
    status: 'Too short',
  },
];

const seoPages = [
  { title: 'Shopify alt text generator', href: '/shopify-alt-text-generator' },
  { title: 'Bulk alt text generator', href: '/bulk-alt-text-generator' },
  { title: 'Shopify image SEO checker', href: '/shopify-image-seo-checker' },
  { title: 'Shopify schema checker', href: '/shopify-schema-checker' },
  {
    title: 'Shopify alt text CSV generator',
    href: '/shopify-alt-text-csv-generator',
  },
  {
    title: 'AI alt text generator for Shopify',
    href: '/ai-alt-text-generator-for-shopify',
  },
  { title: 'WooCommerce alt text generator', href: '/woocommerce-alt-text-generator' },
];

const selfServeEnabled = process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED === 'true';

const pricingPlans = [
  {
    icon: WandSparkles,
    name: 'Free audit',
    price: '$0',
    body: 'Scan the first 5 products, find missing alt text, generate editable suggestions, and export a review file.',
    cta: 'Scan 5 products',
    href: '/#tool',
    features: ['5 products per scan', 'Store URL or CSV fallback', 'Editable suggestions'],
  },
  {
    icon: Mail,
    name: selfServeEnabled ? 'Self-serve cleanup' : 'Private cleanup',
    price: '$19',
    body: selfServeEnabled
      ? 'Upload your official Shopify Products CSV, pay once, and download a cleaned file for up to 100 product images.'
      : 'Starter manual cleanup for up to 100 product images using your official Shopify Products CSV.',
    cta: selfServeEnabled ? 'Upload CSV' : 'Start cleanup',
    href: selfServeEnabled ? '/self-serve' : '/#lead',
    features: ['Up to 100 product images', 'Shopify-ready CSV', 'No store login needed'],
  },
  {
    icon: Store,
    name: 'Growth',
    price: '$29/mo',
    body: 'Planned subscription for stores that need larger scans, saved history, and direct import/export.',
    cta: 'Join waitlist',
    href: '/#lead',
    features: ['Up to 100 products per scan', 'History and exports', 'Collection-aware prompts'],
  },
  {
    icon: Users,
    name: 'Agency',
    price: '$79/mo',
    body: 'Planned client workspace for agencies managing image SEO cleanup across multiple stores.',
    cta: 'Talk to us',
    href: '/#lead',
    features: ['Multi-store audits', 'White-label reports', 'Priority cleanup help'],
  },
];

export function ImageSeoHome() {
  return (
    <div className="flex flex-col bg-background">
      <section className="mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-7xl content-center gap-10 px-4 py-12 md:grid-cols-[0.9fr_1.1fr] md:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col justify-center">
          <Badge variant="outline" className="mb-5 w-fit gap-2 border-primary/30 bg-primary/5 text-primary">
            <ShoppingBag className="size-3.5" />
            Built for Shopify stores that need fixes, not another report
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-normal md:text-6xl">
            Find weak Shopify image alt text and turn it into a cleanup file.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            ImageSEOFix scans a real store sample, shows the alt text that needs
            work, and gives merchants a safe path to copy fixes or prepare a
            Shopify CSV cleanup workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <TrackedLink eventName="hero_scan_click" href="/#tool">
                Scan 5 products free
                <ArrowRight className="size-4" />
              </TrackedLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <TrackedLink eventName="pricing_view" href="/#pricing">
                View pricing
              </TrackedLink>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              Read-only public scan
            </div>
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-primary" />
              No Shopify app install
            </div>
            <div className="flex items-center gap-2">
              <Search className="size-4 text-primary" />
              Manual or CSV fix path
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center">
          <div className="min-w-0 w-full overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="border-b bg-muted/35 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Sample cleanup table</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    What a merchant sees after scanning 5 products
                  </p>
                </div>
                <Badge variant="secondary">5 products free</Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid min-w-[680px] grid-cols-[1.1fr_0.75fr_1.15fr_0.75fr] gap-3 border-b px-5 py-3 text-xs font-medium uppercase text-muted-foreground">
                <span>Image</span>
                <span>Current</span>
                <span>Suggested fix</span>
                <span>Status</span>
              </div>
              {exampleRows.map((row) => (
                <div
                  key={row.image}
                  className="grid min-w-[680px] grid-cols-[1.1fr_0.75fr_1.15fr_0.75fr] gap-3 border-b px-5 py-4 text-sm last:border-b-0"
                >
                  <span className="truncate text-muted-foreground">{row.image}</span>
                  <span>{row.current}</span>
                  <span className="line-clamp-2">{row.fix}</span>
                  <span className="text-primary">{row.status}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 bg-muted/20 px-5 py-4 text-sm sm:grid-cols-3">
              {['Scan', 'Review', 'Fix in Shopify'].map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ImageSeoAuditor />

      <section id="features" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase text-primary">Workflow</p>
          <h2 className="mt-3 text-3xl font-semibold">
            From scan to a real Shopify fix
          </h2>
          <p className="mt-4 text-muted-foreground">
            The product is intentionally narrow: help a store owner understand
            which images need work, then choose the safest way to update Shopify.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {workflow.map((item) => (
            <div key={item.title} className="rounded-lg border bg-background p-5">
              <item.icon className="size-5 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase text-primary">
              SEO launch map
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Built around real search intent
            </h2>
            <p className="mt-4 text-muted-foreground">
              Each page targets a clear query and points back to the free tool.
              No thin programmatic pages, just useful pages with crawlable copy,
              examples, FAQs, and export workflows.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {seoPages.map((page) => (
              <a
                key={page.href}
                href={page.href}
                className="rounded-lg border bg-background px-4 py-3 text-sm transition-colors hover:bg-accent"
              >
                {page.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="shopify-csv-workflow" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase text-primary">
            Shopify CSV delivery
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            A safe path from audit to import-ready CSV
          </h2>
          <p className="mt-4 text-muted-foreground">
            ImageSEOFix starts with a free preview, then turns a real Shopify
            Products CSV into a file a merchant can review and import. The
            workflow preserves Shopify option and variant columns so the file
            remains safe to test in Shopify&apos;s import preview.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {csvDeliverySteps.map((step, index) => (
            <div key={step.title} className="rounded-lg border bg-background p-5">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Free audit, paid batch workflow
          </h2>
          <p className="mt-4 text-muted-foreground">
            The free tier proves the issue on 5 products. The $1k MRR path is
            a mix of $19 starter cleanups, 35 Growth customers at $29/month, or
            13 Agency customers at $79/month after larger scans are enabled.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-lg border bg-background p-5 shadow-sm"
            >
              <plan.icon className="size-5 text-primary" />
              <div className="mt-4">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
              </div>
              <p className="mt-4 min-h-20 text-sm leading-6 text-muted-foreground">
                {plan.body}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant="outline">
                <TrackedLink
                  eventName="pricing_cta_click"
                  eventPayload={{ plan: plan.name }}
                  href={plan.href}
                >
                  {plan.cta}
                </TrackedLink>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section id="best-practice" className="border-t bg-muted/25">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 md:grid-cols-[0.85fr_1.15fr] md:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase text-primary">
              Best practice
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              How to use the recommendations safely
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Use the free scan as a sample audit. If the problems are real,
              fix a few images manually or move to a CSV cleanup workflow for
              larger catalogs. ImageSEOFix does not write to your store without
              you reviewing the output.
            </p>
            <div className="mt-6 rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">
              Before importing any edited Shopify CSV, keep a backup of the
              original export, keep option and variant columns intact, enable
              matching handles overwrite only on the cleaned copy, and
              spot-check a few products after import.
            </div>
          </div>
          <div className="grid gap-4">
            {bestPracticeSteps.map((step, index) => (
              <div key={step.title} className="grid gap-4 rounded-lg border bg-background p-5 sm:grid-cols-[auto_1fr]">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                      Step {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
