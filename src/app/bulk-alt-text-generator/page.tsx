import { SeoToolPage } from '@/components/image-seo/seo-tool-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bulk Alt Text Generator',
  description:
    'Audit many product images at once, generate editable alt text suggestions, and export a CSV for review.',
  alternates: {
    canonical: '/bulk-alt-text-generator',
  },
};

export default function BulkAltTextGeneratorPage() {
  return (
    <SeoToolPage
      eyebrow="Bulk image cleanup"
      title="Bulk Alt Text Generator for Shopify product catalogs"
      description="Audit many product images from one Shopify Products CSV, identify weak alt text in a review table, and prepare a cleaned file without installing another Shopify app."
      primaryAction="Audit a bulk CSV"
      outcome="The free preview checks the first five products so you can see the issue count, review suggestions, and decide whether a full CSV cleanup is worth paying for."
      contentBlocks={[
        {
          title: 'Start with the official Shopify export',
          body: 'A full Products CSV keeps the product, option, variant, image, and market columns that Shopify expects during an import.',
          points: [
            'Use Products > Export in Shopify Admin rather than creating a simplified spreadsheet.',
            'Keep the original file untouched as a rollback copy.',
            'Make sure image URLs are public HTTPS URLs before planning an import.',
          ],
        },
        {
          title: 'Review the rows that need attention',
          body: 'The bulk workflow is designed to surface the small number of repeatable quality issues that make a catalog hard to maintain manually.',
          points: [
            'Find missing image alt text across product rows.',
            'Flag one-word, generic, and overly long descriptions for review.',
            'Keep a product-aware suggested value next to the current value.',
          ],
        },
        {
          title: 'Export safely and test Shopify preview',
          body: 'The delivery path only updates Image Alt Text, preserving the shape of the source export for a cautious Shopify import.',
          points: [
            'Download a five-product preview before paying for a larger cleanup.',
            'Use Shopify import preview to inspect matching handles and changed rows.',
            'Spot-check product media after import and keep the source backup.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'How many images can the free tool check?',
          answer: 'The free preview is intentionally capped at the first five products. It is meant to prove output quality before a paid full-catalog cleanup.',
        },
        {
          question: 'Will ImageSEOFix remove my CSV columns?',
          answer: 'No. A Shopify-ready export keeps the original columns and changes only Image Alt Text for the reviewed rows.',
        },
        {
          question: 'Can I use any CSV?',
          answer: 'You can audit many CSV formats, but only an official Shopify Products CSV with the needed image and variant fields should be used for an import-ready output.',
        },
      ]}
      relatedTools={[
        {
          href: '/shopify-alt-text-csv-generator',
          label: 'Shopify CSV generator',
          description: 'Follow the import-safe CSV workflow step by step.',
        },
        {
          href: '/shopify-alt-text-generator',
          label: 'Shopify alt text generator',
          description: 'Generate and manually review a smaller set of product image descriptions.',
        },
        {
          href: '/shopify-image-seo-checker',
          label: 'Shopify image SEO checker',
          description: 'Run an audit when you need a clear issue summary first.',
        },
      ]}
    />
  );
}
