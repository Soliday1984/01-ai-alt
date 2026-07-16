import type { Metadata } from 'next';

import { RecoverClient } from './recover-client';

export const metadata: Metadata = {
  title: 'Recover your ImageSEOFix cleanup job',
  description: 'Request a secure link to reopen a Shopify CSV cleanup job.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RecoverPage() {
  return <RecoverClient />;
}
