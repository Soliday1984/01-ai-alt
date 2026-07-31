import { ImageSeoAuditor } from '@/components/image-seo/image-seo-auditor';
import { TrackedLink } from '@/components/image-seo/tracked-link';
import { SiteFooter } from '@/components/site-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, FileSpreadsheet, SearchCheck, ShieldCheck } from 'lucide-react';

type ContentBlock = {
  title: string;
  body: string;
  points: string[];
};

type Faq = {
  question: string;
  answer: string;
};

type RelatedTool = {
  href: string;
  label: string;
  description: string;
};

type SeoToolPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  outcome: string;
  contentBlocks: ContentBlock[];
  faqs: Faq[];
  relatedTools: RelatedTool[];
};

export function SeoToolPage({
  eyebrow,
  title,
  description,
  primaryAction,
  outcome,
  contentBlocks,
  faqs,
  relatedTools,
}: SeoToolPageProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="border-b bg-muted/20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-6 lg:px-8 lg:py-20">
          <div className="min-w-0">
            <Badge variant="outline" className="w-fit border-primary/30 bg-primary/5 text-primary">
              {eyebrow}
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-normal md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <TrackedLink eventName="seo_page_tool_click" eventPayload={{ page: title }} href="#tool">
                  {primaryAction}
                  <ArrowRight className="size-4" />
                </TrackedLink>
              </Button>
              <Button asChild size="lg" variant="outline">
                <TrackedLink eventName="seo_page_csv_path_click" eventPayload={{ page: title }} href="/shopify-alt-text-csv-generator">
                  Shopify CSV workflow
                </TrackedLink>
              </Button>
            </div>
          </div>

          <div className="grid content-start gap-4">
            <div className="rounded-lg border bg-background p-5 shadow-sm">
              <SearchCheck className="size-5 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">What the free check gives you</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{outcome}</p>
            </div>
            <div className="rounded-lg border bg-background p-5 shadow-sm">
              <FileSpreadsheet className="size-5 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">Safe Shopify handoff</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Review suggestions before changing a store. For a full catalog, ImageSEOFix keeps the official Shopify Products CSV shape and updates only Image Alt Text.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-5 shadow-sm">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">No app permissions required</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Start from a public storefront or export a Products CSV yourself. The tool never writes to Shopify without your review.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ImageSeoAuditor />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {contentBlocks.map((block) => (
            <article key={block.title} className="rounded-lg border bg-background p-6">
              <h2 className="text-xl font-semibold">{block.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{block.body}</p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                {block.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/25">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase text-primary">Related Shopify tools</p>
          <h2 className="mt-3 text-3xl font-semibold">Choose the workflow that matches the job</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {relatedTools.map((tool) => (
              <a key={tool.href} href={tool.href} className="rounded-lg border bg-background p-5 transition-colors hover:bg-accent">
                <h3 className="font-semibold">{tool.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Open tool <ArrowRight className="size-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase text-primary">FAQ</p>
        <h2 className="mt-3 text-3xl font-semibold">Before you update Shopify image alt text</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-lg border bg-background p-5">
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
