'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Copy,
  FileJson,
  RotateCcw,
  SearchCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type JsonObject = Record<string, unknown>;

type AuditStatus = 'pass' | 'warning' | 'error';

type AuditItem = {
  label: string;
  status: AuditStatus;
  detail: string;
  fix: string;
};

const sampleInput = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Organic Cotton Tote Bag",
  "image": [
    "https://cdn.shopify.com/s/files/example/tote-bag-front.jpg"
  ],
  "description": "A reusable organic cotton tote bag for daily shopping.",
  "brand": {
    "@type": "Brand",
    "name": "North Market"
  },
  "sku": "TOTE-ORGANIC-01",
  "offers": {
    "@type": "Offer",
    "price": "24.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/products/organic-cotton-tote-bag"
  }
}
</script>`;

const fixSnippet = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{ product.title | escape }}",
  "image": [
    "{{ product.featured_image | image_url: width: 1200 }}"
  ],
  "description": "{{ product.description | strip_html | escape }}",
  "brand": {
    "@type": "Brand",
    "name": "{{ product.vendor | escape }}"
  },
  "sku": "{{ product.selected_or_first_available_variant.sku }}",
  "offers": {
    "@type": "Offer",
    "price": "{{ product.selected_or_first_available_variant.price | money_without_currency }}",
    "priceCurrency": "{{ shop.currency }}",
    "availability": "https://schema.org/InStock",
    "url": "{{ shop.url }}{{ product.url }}"
  }
}
</script>`;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  return value == null ? [] : [value];
}

function readString(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
}

function hasNonEmpty(value: unknown) {
  if (Array.isArray(value)) {
    return value.some(hasNonEmpty);
  }

  if (isObject(value)) {
    return Object.values(value).some(hasNonEmpty);
  }

  return readString(value).length > 0;
}

function typeNames(node: JsonObject) {
  return toArray(node['@type'])
    .map(readString)
    .filter(Boolean);
}

function hasType(node: JsonObject, type: string) {
  return typeNames(node).some((name) => name.toLowerCase() === type.toLowerCase());
}

function flattenNodes(value: unknown): JsonObject[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenNodes);
  }

  if (!isObject(value)) {
    return [];
  }

  const nested = [
    value['@graph'],
    value.mainEntity,
    value.itemListElement,
    value.offers,
    value.review,
    value.aggregateRating,
  ].flatMap(flattenNodes);

  return [value, ...nested];
}

function extractJsonLd(input: string) {
  const blocks: string[] = [];
  const scriptPattern =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = scriptPattern.exec(input);

  while (match) {
    blocks.push(match[1].replace(/<!--|-->/g, '').trim());
    match = scriptPattern.exec(input);
  }

  if (blocks.length === 0 && input.trim()) {
    blocks.push(input.trim());
  }

  const values: unknown[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    try {
      values.push(JSON.parse(block));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown parse error';
      errors.push(`Block ${index + 1}: ${message}`);
    }
  });

  return { values, errors };
}

function firstProduct(nodes: JsonObject[]) {
  return nodes.find((node) => hasType(node, 'Product'));
}

function productOffers(product?: JsonObject) {
  if (!product) {
    return [];
  }

  return toArray(product.offers).filter(isObject);
}

function auditStructuredData(input: string) {
  const { values, errors } = extractJsonLd(input);
  const nodes = values.flatMap(flattenNodes);
  const products = nodes.filter((node) => hasType(node, 'Product'));
  const product = firstProduct(nodes);
  const offers = productOffers(product);
  const breadcrumbs = nodes.filter((node) => hasType(node, 'BreadcrumbList'));
  const hasRating = Boolean(product?.aggregateRating);
  const hasReview = toArray(product?.review).length > 0;
  const hasShipping = offers.some((offer) => hasNonEmpty(offer.shippingDetails));
  const hasReturns = offers.some((offer) => hasNonEmpty(offer.hasMerchantReturnPolicy));

  const items: AuditItem[] = [];

  function add(
    label: string,
    status: AuditStatus,
    detail: string,
    fix: string,
  ) {
    items.push({ label, status, detail, fix });
  }

  if (errors.length > 0) {
    add(
      'Valid JSON-LD',
      'error',
      errors[0],
      'Paste a complete JSON-LD object or the full <script type="application/ld+json"> block.',
    );
  } else {
    add(
      'Valid JSON-LD',
      'pass',
      `${values.length} JSON-LD block${values.length === 1 ? '' : 's'} parsed.`,
      'Keep the JSON-LD in the product template so crawlers can read it on first load.',
    );
  }

  add(
    'Product schema detected',
    product ? 'pass' : 'error',
    product ? 'A Product node is available.' : 'No Product node was found.',
    'Add one Product JSON-LD node to each Shopify product page.',
  );

  add(
    'Duplicate Product schema',
    products.length > 1 ? 'warning' : 'pass',
    products.length > 1
      ? `${products.length} Product nodes found. Duplicate app and theme markup can conflict.`
      : `${products.length} Product node found.`,
    'Keep one primary Product node, or make sure duplicate app markup does not disagree on price, image, or availability.',
  );

  add(
    'Product name',
    hasNonEmpty(product?.name) ? 'pass' : 'error',
    hasNonEmpty(product?.name) ? readString(product?.name) : 'Missing product name.',
    'Map Shopify product.title into Product.name.',
  );

  add(
    'Product image',
    hasNonEmpty(product?.image) ? 'pass' : 'error',
    hasNonEmpty(product?.image) ? 'Image field is present.' : 'Missing product image.',
    'Use the featured image and variant images in Product.image.',
  );

  add(
    'Description',
    hasNonEmpty(product?.description) ? 'pass' : 'warning',
    hasNonEmpty(product?.description)
      ? 'Description is present.'
      : 'Missing product description.',
    'Use the cleaned Shopify product description so Google and AI shoppers understand the item.',
  );

  add(
    'Brand',
    hasNonEmpty(product?.brand) ? 'pass' : 'warning',
    hasNonEmpty(product?.brand) ? 'Brand is present.' : 'Missing brand.',
    'Map Product.brand to product.vendor or a stable store brand.',
  );

  add(
    'SKU or product identifier',
    hasNonEmpty(product?.sku) ||
      hasNonEmpty(product?.gtin) ||
      hasNonEmpty(product?.gtin13) ||
      hasNonEmpty(product?.gtin14) ||
      hasNonEmpty(product?.mpn)
      ? 'pass'
      : 'warning',
    'sku, gtin, or mpn helps product matching.',
    'Map variant.sku, gtin, or mpn where available.',
  );

  add(
    'Offer schema',
    offers.length > 0 ? 'pass' : 'error',
    offers.length > 0 ? `${offers.length} Offer node found.` : 'Missing offers.',
    'Add Product.offers with price, currency, availability, and canonical product URL.',
  );

  add(
    'Offer price',
    offers.some((offer) => hasNonEmpty(offer.price)) ? 'pass' : 'error',
    offers.some((offer) => hasNonEmpty(offer.price))
      ? 'Price is present.'
      : 'Missing Offer.price.',
    'Map selected_or_first_available_variant.price to offers.price.',
  );

  add(
    'Offer currency',
    offers.some((offer) => hasNonEmpty(offer.priceCurrency)) ? 'pass' : 'error',
    offers.some((offer) => hasNonEmpty(offer.priceCurrency))
      ? 'Currency is present.'
      : 'Missing Offer.priceCurrency.',
    'Use shop.currency or the active market currency.',
  );

  add(
    'Availability',
    offers.some((offer) => hasNonEmpty(offer.availability)) ? 'pass' : 'warning',
    offers.some((offer) => hasNonEmpty(offer.availability))
      ? 'Availability is present.'
      : 'Missing Offer.availability.',
    'Use https://schema.org/InStock or https://schema.org/OutOfStock based on variant inventory.',
  );

  add(
    'Rating or review signal',
    hasRating || hasReview ? 'pass' : 'warning',
    hasRating || hasReview
      ? 'Rating or review data is present.'
      : 'No AggregateRating or Review found.',
    'Only add ratings if they are real and visible on the page.',
  );

  add(
    'BreadcrumbList',
    breadcrumbs.length > 0 ? 'pass' : 'warning',
    breadcrumbs.length > 0
      ? 'Breadcrumb structured data is present.'
      : 'No BreadcrumbList found.',
    'Add BreadcrumbList markup for collection and product hierarchy when available.',
  );

  add(
    'Shipping details',
    hasShipping ? 'pass' : 'warning',
    hasShipping
      ? 'Shipping details are present.'
      : 'No Offer.shippingDetails found.',
    'Add shippingDetails when you have stable shipping policy data.',
  );

  add(
    'Return policy',
    hasReturns ? 'pass' : 'warning',
    hasReturns
      ? 'Return policy is present.'
      : 'No hasMerchantReturnPolicy found.',
    'Add hasMerchantReturnPolicy when returns are clear and consistent.',
  );

  const errorCount = items.filter((item) => item.status === 'error').length;
  const warningCount = items.filter((item) => item.status === 'warning').length;
  const score = Math.max(0, 100 - errorCount * 14 - warningCount * 6);

  return {
    score,
    items,
    products: products.length,
    offers: offers.length,
    breadcrumbs: breadcrumbs.length,
    errorCount,
    warningCount,
  };
}

function statusIcon(status: AuditStatus) {
  if (status === 'pass') {
    return <CheckCircle2 className="size-4 text-primary" />;
  }

  if (status === 'warning') {
    return <TriangleAlert className="size-4 text-amber-600" />;
  }

  return <AlertCircle className="size-4 text-destructive" />;
}

function statusBadge(status: AuditStatus) {
  if (status === 'pass') {
    return <Badge variant="outline">Ready</Badge>;
  }

  if (status === 'warning') {
    return <Badge variant="secondary">Review</Badge>;
  }

  return <Badge variant="destructive">Fix</Badge>;
}

export function ShopifySchemaChecker() {
  const [input, setInput] = useState(sampleInput);
  const [copied, setCopied] = useState(false);
  const audit = useMemo(() => auditStructuredData(input), [input]);

  async function copySnippet() {
    await navigator.clipboard.writeText(fixSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-col">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl content-center gap-10 px-4 py-12 md:grid-cols-[0.92fr_1.08fr] md:px-6 lg:px-8">
        <div className="flex flex-col justify-center">
          <Badge variant="outline" className="mb-5 w-fit gap-2">
            <FileJson className="size-3.5" />
            Product SEO tools
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
            Shopify Schema Checker
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Paste Product JSON-LD or Shopify product page HTML to check Product,
            Offer, Review, Breadcrumb, shipping, and return policy structured
            data before you ship a theme change.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#checker">
                Run schema audit
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/">Alt text tool</a>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              Browser-only audit
            </div>
            <div className="flex items-center gap-2">
              <SearchCheck className="size-4 text-primary" />
              Product rich result fields
            </div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-4 text-primary" />
              Shopify fix snippet
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full overflow-hidden rounded-lg border bg-background shadow-sm">
            <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted/40 px-5 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Readiness score</p>
                <p className="mt-2 text-5xl font-semibold">{audit.score}</p>
              </div>
              <div className="flex flex-col items-end justify-center gap-2">
                <Badge variant="outline">{audit.products} Product</Badge>
                <Badge variant="outline">{audit.offers} Offer</Badge>
                <Badge variant="outline">{audit.breadcrumbs} Breadcrumb</Badge>
              </div>
            </div>
            <div className="divide-y">
              {audit.items.slice(0, 6).map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-4 text-sm"
                >
                  {statusIcon(item.status)}
                  <span>{item.label}</span>
                  {statusBadge(item.status)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="checker"
        className="border-border bg-background mx-auto grid w-full max-w-7xl scroll-mt-24 gap-6 border-y px-4 py-8 md:grid-cols-[0.95fr_1.05fr] md:px-6 lg:px-8"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg">
              <Code2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Free Shopify Product structured data audit
              </p>
              <h2 className="text-2xl font-semibold">
                Paste JSON-LD or product page HTML
              </h2>
            </div>
          </div>

          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-96 resize-y font-mono text-sm"
            aria-label="Shopify schema input"
            spellCheck={false}
          />

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => setInput(sampleInput)}>
              <RotateCcw className="size-4" />
              Reset sample
            </Button>
            <Button type="button" variant="outline" onClick={copySnippet}>
              <Copy className="size-4" />
              {copied ? 'Copied' : 'Copy Liquid snippet'}
            </Button>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            The MVP runs locally in the browser. It does not fetch URLs, upload
            product data, call AI APIs, or change your Shopify theme.
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="border-border bg-muted/30 rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="mt-2 text-3xl font-semibold">{audit.score}</p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Fixes</p>
              <p className="mt-2 text-3xl font-semibold">{audit.errorCount}</p>
            </div>
            <div className="border-border bg-muted/30 rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Reviews</p>
              <p className="mt-2 text-3xl font-semibold">{audit.warningCount}</p>
            </div>
          </div>

          <div className="border-border overflow-hidden rounded-lg border">
            <div className="bg-muted/40 grid grid-cols-[1fr_auto] gap-3 border-b px-4 py-3 text-sm font-medium">
              <span>Structured data check</span>
              <span>Status</span>
            </div>
            <div className="max-h-[620px] divide-y overflow-auto">
              {audit.items.map((item) => (
                <div key={item.label} className="px-4 py-4 text-sm">
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                    {statusIcon(item.status)}
                    <span className="font-medium">{item.label}</span>
                    {statusBadge(item.status)}
                  </div>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
                  <p className="mt-2 leading-6">{item.fix}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-border bg-muted/30 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-primary" />
              Paid path
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              If this page gets search traffic, the paid version can add bulk
              product checks, CSV export, white-label reports, and Shopify theme
              fix snippets for agencies.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase text-primary">
            Shopify product SEO
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            What the schema audit checks
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Shopify product pages usually need one clean Product schema node with
            an Offer, price, currency, availability, image, description, brand,
            SKU or product identifier, and optional review, shipping, return
            policy, and BreadcrumbList markup. The checker highlights the fields
            most likely to affect rich result eligibility and AI commerce
            readiness.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            [
              'Rich result basics',
              'Product name, image, description, brand, SKU, Offer price, currency, and availability.',
            ],
            [
              'Trust signals',
              'Review, AggregateRating, shippingDetails, and return policy fields when they are real and visible.',
            ],
            [
              'Shopify-specific cleanup',
              'Duplicate Product schema from theme and app markup, missing variant data, and incomplete Liquid mappings.',
            ],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border bg-background p-5">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
