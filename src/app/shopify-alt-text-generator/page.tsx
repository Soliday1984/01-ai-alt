import { SeoToolPage } from '@/components/image-seo/seo-tool-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopify Alt Text Generator',
  description:
    'Generate Shopify product image alt text from CSV rows, review issues, and export a clean bulk update file.',
  alternates: {
    canonical: '/shopify-alt-text-generator',
  },
};

export default function ShopifyAltTextGeneratorPage() {
  return (
    <SeoToolPage
      eyebrow="Shopify product image workflow"
      title="Shopify Alt Text Generator for product images"
      description="Turn a Shopify product export into editable, product-aware alt text suggestions. Start with five products free, review every suggestion, then use a Shopify-ready CSV for the rest of the catalog."
      primaryAction="Generate alt text for 5 products"
      outcome="See missing, too-short, generic, and overlong alt text alongside an editable suggestion based on the product title and image row."
      contentBlocks={[
        {
          title: 'Generate a useful first draft',
          body: 'The generator gives a merchant a reviewable starting point instead of automatically overwriting product media.',
          points: [
            'Uses the product title and image row to keep each suggestion tied to the product.',
            'Flags blank, generic, short, and overlong text before you export.',
            'Lets you copy a few changes manually when only a small set needs work.',
          ],
        },
        {
          title: 'Review before Shopify import',
          body: 'Alt text is customer-facing accessibility copy as well as SEO metadata, so the merchant remains in control of every update.',
          points: [
            'Keep distinctive colors, material, product type, and view when they matter.',
            'Remove file names, SKU fragments, and repeated filler wording.',
            'Preserve good existing alt text instead of replacing it only to add keywords.',
          ],
        },
        {
          title: 'Move from five products to a catalog',
          body: 'Use the free preview to validate quality, then upload the official Shopify Products CSV for a safe full-catalog cleanup.',
          points: [
            'Export Products CSV from Shopify Admin and retain the original backup.',
            'Review the cleaned copy in Shopify import preview before final import.',
            'Pay once for the current self-serve cleanup when the preview is useful.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'Can this change Shopify alt text automatically?',
          answer: 'No. ImageSEOFix prepares suggestions and a CSV for your review. You choose whether to copy changes manually or import a reviewed CSV in Shopify.',
        },
        {
          question: 'What should good Shopify alt text include?',
          answer: 'Describe the product and meaningful visual detail in plain language. A useful alt text is specific enough to distinguish the image without repeating keywords unnaturally.',
        },
        {
          question: 'Do I need to install a Shopify app?',
          answer: 'No. Use a public storefront for a small scan or export your own Products CSV from Shopify. No admin credentials are shared with ImageSEOFix.',
        },
      ]}
      relatedTools={[
        {
          href: '/bulk-alt-text-generator',
          label: 'Bulk alt text generator',
          description: 'Use a CSV-first workflow when a catalog has many product images to review.',
        },
        {
          href: '/shopify-image-seo-checker',
          label: 'Shopify image SEO checker',
          description: 'Audit existing alt text first when you need to understand the problem before generating changes.',
        },
        {
          href: '/shopify-alt-text-csv-generator',
          label: 'Shopify CSV generator',
          description: 'Learn the import-safe CSV path for a larger cleanup.',
        },
      ]}
    />
  );
}
