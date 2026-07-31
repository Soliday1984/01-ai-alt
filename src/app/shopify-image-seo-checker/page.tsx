import { SeoToolPage } from '@/components/image-seo/seo-tool-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopify Image SEO Checker',
  description:
    'Check Shopify product images for missing, weak, generic, or overly long alt text before publishing.',
  alternates: {
    canonical: '/shopify-image-seo-checker',
  },
};

export default function ShopifyImageSeoCheckerPage() {
  return (
    <SeoToolPage
      eyebrow="Image SEO audit"
      title="Shopify Image SEO Checker for product alt text"
      description="Check a public Shopify storefront or Products CSV for image alt text that is missing, generic, too short, or too long. See a clear issue list before you make changes."
      primaryAction="Check 5 Shopify products"
      outcome="A small audit shows which product images need attention, why they are flagged, and an editable next step for each row."
      contentBlocks={[
        {
          title: 'Find the problems that matter',
          body: 'The checker focuses on issues a merchant can understand and fix, not a vague image SEO score with no path to action.',
          points: [
            'Missing alt text leaves a product image without a useful description.',
            'Generic labels such as “image” or “photo” do not distinguish the product.',
            'Very short, overly long, or filename-style text needs manual review.',
          ],
        },
        {
          title: 'Use the audit to prioritize work',
          body: 'A free five-product sample makes it easier to decide whether the store has an isolated cleanup task or a catalog-wide process issue.',
          points: [
            'Start with products that have multiple images or high commercial value.',
            'Check whether product titles provide enough context for a useful suggestion.',
            'Use the issue count to estimate whether a CSV cleanup will save time.',
          ],
        },
        {
          title: 'Fix without giving away store access',
          body: 'After the audit, merchants can copy a few values in Shopify Admin or use a reviewed CSV for a controlled bulk update.',
          points: [
            'The public scan is read-only and never writes to Shopify.',
            'No Shopify app installation or admin login is required for the first audit.',
            'Import only after reviewing Shopify preview and retaining a backup.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'Does this checker inspect every image on my site?',
          answer: 'The free public scan checks five products. For a broader audit, upload the official Shopify Products CSV and review the preview before purchasing a full cleanup.',
        },
        {
          question: 'Is missing alt text always an SEO problem?',
          answer: 'It is first an accessibility and product-discovery quality issue. Product-specific alt text can also make image context clearer to search engines and shoppers.',
        },
        {
          question: 'What happens after the checker finds issues?',
          answer: 'You can copy small fixes manually, export an audit, or move to a Shopify-ready CSV cleanup after reviewing the preview output.',
        },
      ]}
      relatedTools={[
        {
          href: '/shopify-alt-text-generator',
          label: 'Shopify alt text generator',
          description: 'Turn the audit rows into editable product-aware suggestions.',
        },
        {
          href: '/bulk-alt-text-generator',
          label: 'Bulk alt text generator',
          description: 'Process a larger Shopify catalog from one CSV export.',
        },
        {
          href: '/shopify-schema-checker',
          label: 'Shopify schema checker',
          description: 'Check product structured data as a separate Shopify SEO task.',
        },
      ]}
    />
  );
}
