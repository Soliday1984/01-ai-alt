import { ImageSeoHome } from '@/components/image-seo/image-seo-home';
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
  return <ImageSeoHome />;
}
