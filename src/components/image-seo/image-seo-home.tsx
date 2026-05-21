import { ImageSeoAuditor } from '@/components/image-seo/image-seo-auditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Gauge,
  Lock,
  Search,
  ShoppingBag,
  WandSparkles,
} from 'lucide-react';

const workflow = [
  {
    icon: FileSpreadsheet,
    title: 'Import Shopify CSV',
    body: 'Paste product export rows or upload a CSV with image URL, current alt text, and product title.',
  },
  {
    icon: Gauge,
    title: 'Find image SEO gaps',
    body: 'Flag missing, too-short, too-long, or generic alt text before Google indexes weak product pages.',
  },
  {
    icon: WandSparkles,
    title: 'Generate editable alt text',
    body: 'Create descriptive product-aware suggestions, then export a clean CSV for your team or store workflow.',
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

export function ImageSeoHome() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl content-center gap-10 px-4 py-12 md:grid-cols-[0.92fr_1.08fr] md:px-6 lg:px-8">
        <div className="flex flex-col justify-center">
          <Badge variant="outline" className="mb-5 w-fit gap-2">
            <ShoppingBag className="size-3.5" />
            Built for Shopify merchants and SEO agencies
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
            Shopify alt text generator for product image SEO
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            ImageSEOFix audits missing alt text, writes product-aware
            suggestions, and exports a Shopify-ready CSV so ecommerce teams can
            improve image SEO without opening every product one by one.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="/#tool">
                Run free audit
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/#pricing">View pricing</a>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              CSV-first MVP
            </div>
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-primary" />
              Browser-only demo
            </div>
            <div className="flex items-center gap-2">
              <Search className="size-4 text-primary" />
              SEO-ready pages
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full overflow-hidden rounded-lg border bg-muted/30 shadow-sm">
            <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-3 border-b bg-background/80 px-4 py-3 text-sm font-medium">
              <span>Product image</span>
              <span>Current alt</span>
              <span>Fix</span>
            </div>
            {[
              ['linen-shirt-front.jpg', 'Missing', 'White linen shirt product image'],
              ['walnut-desk-lamp.png', 'lamp', 'Walnut desk lamp product image'],
              ['ceramic-mug-main.jpg', 'Ready', 'No issue'],
            ].map(([image, issue, fix]) => (
              <div
                key={image}
                className="grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-3 border-b px-4 py-4 text-sm last:border-b-0"
              >
                <span className="truncate text-muted-foreground">{image}</span>
                <span>{issue}</span>
                <span className="line-clamp-2">{fix}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ImageSeoAuditor />

      <section id="features" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase text-primary">Workflow</p>
          <h2 className="mt-3 text-3xl font-semibold">
            From export to publishable alt text
          </h2>
          <p className="mt-4 text-muted-foreground">
            The first release is intentionally narrow: solve one painful store
            maintenance job, create useful SEO content around it, and charge for
            private batch workflows once demand is proven.
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

      <section id="pricing" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Free audit, paid batch workflow
          </h2>
          <p className="mt-4 text-muted-foreground">
            The $1k MRR path is 35 Growth customers at $29/month, or 17 agency
            customers at $59/month after direct Shopify import is added.
          </p>
        </div>
      </section>
    </div>
  );
}
