import type { MetadataRoute } from 'next';

const baseUrl = 'https://01-ai-alt.vercel.app';

const routes = [
  '',
  '/shopify-alt-text-generator',
  '/bulk-alt-text-generator',
  '/shopify-image-seo-checker',
  '/shopify-schema-checker',
  '/shopify-alt-text-csv-generator',
  '/ai-alt-text-generator-for-shopify',
  '/woocommerce-alt-text-generator',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
