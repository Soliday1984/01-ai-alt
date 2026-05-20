import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

const siteUrl = 'https://01-ai-alt.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ImageSEOFix - Shopify alt text generator',
    template: '%s | ImageSEOFix',
  },
  description:
    'Audit Shopify product image alt text, generate editable SEO suggestions, and export a Shopify-ready CSV in your browser.',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
