import { ImageSeoHome } from '@/components/image-seo/image-seo-home';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;

  return constructMetadata({
    title: 'Shopify Alt Text Generator | ImageSEOFix',
    description:
      'Audit Shopify product image alt text, generate SEO-friendly suggestions, and export a clean CSV for bulk updates.',
    canonicalUrl: getUrlWithLocale('/shopify-alt-text-generator', locale),
  });
}

export default function ShopifyAltTextGeneratorPage() {
  return <ImageSeoHome />;
}
