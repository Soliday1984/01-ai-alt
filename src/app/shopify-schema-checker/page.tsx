import { ShopifySchemaChecker } from '@/components/image-seo/shopify-schema-checker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopify Schema Checker - Product Structured Data Audit',
  description:
    'Check Product, Offer, Review, Breadcrumb, shipping, and return policy structured data for Shopify product pages.',
  alternates: {
    canonical: '/shopify-schema-checker',
  },
};

export default function ShopifySchemaCheckerPage() {
  return <ShopifySchemaChecker />;
}
