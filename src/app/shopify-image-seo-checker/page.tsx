import { ImageSeoHome } from '@/components/image-seo/image-seo-home';
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
  return <ImageSeoHome />;
}
