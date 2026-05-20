import { ImageSeoHome } from '@/components/image-seo/image-seo-home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Alt Text Generator for Shopify',
  description:
    'Generate product-aware Shopify alt text suggestions and review every row before importing changes.',
  alternates: {
    canonical: '/ai-alt-text-generator-for-shopify',
  },
};

export default function AiAltTextGeneratorForShopifyPage() {
  return <ImageSeoHome />;
}
