import { ImageSeoHome } from '@/components/image-seo/image-seo-home';
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
  return <ImageSeoHome />;
}
