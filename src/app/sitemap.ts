import type { MetadataRoute } from 'next';

const baseUrl = 'https://imageseofix.com';

const routes = [
  '',
  '/shopify-alt-text-generator',
  '/bulk-alt-text-generator',
  '/shopify-image-seo-checker',
  '/shopify-schema-checker',
  '/shopify-alt-text-csv-generator',
  '/ai-alt-text-generator-for-shopify',
  '/woocommerce-alt-text-generator',
  '/privacy',
  '/terms',
  '/refund-policy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route.startsWith('/shopify-') || route.startsWith('/bulk-') ? 0.9 : 0.7,
  }));
}
