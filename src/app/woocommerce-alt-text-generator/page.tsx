import { ImageSeoHome } from '@/components/image-seo/image-seo-home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WooCommerce Alt Text Generator',
  description:
    'Use the ImageSEOFix CSV workflow to audit product image alt text and prepare editable SEO suggestions.',
  alternates: {
    canonical: '/woocommerce-alt-text-generator',
  },
};

export default function WooCommerceAltTextGeneratorPage() {
  return <ImageSeoHome />;
}
