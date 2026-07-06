import type { Metadata } from 'next';
import { Suspense } from 'react';

import { SelfServeClient } from './self-serve-client';

export const metadata: Metadata = {
  title: 'Self-serve Shopify CSV Cleanup',
  description:
    'Upload your official Shopify Products CSV, generate cleaned image alt text, pay once, and download a Shopify-ready CSV.',
  alternates: {
    canonical: '/self-serve',
  },
};

export default function SelfServePage() {
  return (
    <main className="min-h-dvh bg-background">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-5xl px-4 py-16 text-sm text-muted-foreground md:px-6 lg:px-8">
            Loading self-serve cleanup...
          </div>
        }
      >
        <SelfServeClient />
      </Suspense>
    </main>
  );
}
