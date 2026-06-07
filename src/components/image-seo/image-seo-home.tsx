import { ImageSeoAuditor } from '@/components/image-seo/image-seo-auditor';
import { TrackedLink } from '@/components/image-seo/tracked-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle2,
  Gauge,
  Lock,
  Mail,
  Search,
  ShoppingBag,
  Store,
  Users,
  WandSparkles,
} from 'lucide-react';

const workflow = [
  {
    icon: Store,
    title: 'Enter a Shopify store URL',
    body: 'Start with the first 5 products for free, so merchants can see image SEO gaps without preparing a file.',
  },
  {
    icon: Gauge,
    title: 'Find image SEO gaps',
    body: 'Flag missing, too-short, too-long, or generic alt text before Google indexes weak product pages.',
  },
  {
    icon: WandSparkles,
    title: 'Upgrade when the store is larger',
    body: 'Growth and Agency tiers expand scan volume, exports, cleanup support, and multi-store workflows.',
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
    name: 'Private cleanup',
    price: '$19+',
    body: 'Send the audit summary and get a quote for a one-time batch cleanup workflow.',
    cta: 'Request audit',
    href: '/#lead',
    features: ['Best for 100+ images', 'Human review option', 'Shopify-ready CSV'],
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
    <div className="flex flex-col">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl content-center gap-10 px-4 py-12 md:grid-cols-[0.92fr_1.08fr] md:px-6 lg:px-8">
        <div className="flex flex-col justify-center">
          <Badge variant="outline" className="mb-5 w-fit gap-2">
            <ShoppingBag className="size-3.5" />
            Built for Shopify merchants and SEO agencies
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
            Shopify image SEO scanner with 5 products free
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            ImageSEOFix scans a Shopify store sample, flags weak product image
            alt text, writes product-aware suggestions, and shows when a larger
            paid cleanup workflow is worth it.
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
              5-product free scan
            </div>
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-primary" />
              Low-cost trial
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
            maintenance job, show value on a small free sample, and charge for
            larger scans or private cleanup once demand is proven.
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
            The free tier proves the issue on 5 products. The $1k MRR path is
            35 Growth customers at $29/month, or 13 Agency customers at
            $79/month after larger scans are enabled.
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
    </div>
  );
}
