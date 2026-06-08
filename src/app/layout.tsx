import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

const siteUrl = 'https://imageseofix.com';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

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
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
