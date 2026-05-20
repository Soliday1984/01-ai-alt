import { ImageSeoHome } from '@/components/image-seo/image-seo-home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopify Alt Text CSV Generator',
  description:
    'Create Shopify-ready CSV exports with current alt text, suggested alt text, and image SEO issue labels.',
  alternates: {
    canonical: '/shopify-alt-text-csv-generator',
  },
};

export default function ShopifyAltTextCsvGeneratorPage() {
  return <ImageSeoHome />;
}
