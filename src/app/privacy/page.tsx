import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ImageSEOFix collects, uses, and protects merchant data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary="This policy explains what ImageSEOFix collects when you audit a store or upload a Shopify Products CSV, and how that information is used."
    >
      <section>
        <h2>Who we are</h2>
        <p>
          ImageSEOFix is operated by AlphaDev LLC, a Wyoming limited liability
          company. This policy applies to imageseofix.com and the ImageSEOFix
          services available through it.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <ul>
          <li>
            Information you submit, including your email address, store URL,
            and Shopify Products CSV contents.
          </li>
          <li>
            Job and delivery data, including generated CSV files, row counts,
            status, timestamps, and a random access token associated with a job.
          </li>
          <li>
            Payment records from Stripe, such as payment status, Checkout
            Session ID, amount, and customer email. We do not receive or store
            your full card number.
          </li>
          <li>
            Basic technical and usage data needed for security, reliability,
            and product analytics, such as IP-derived request information,
            browser details, page events, and error logs.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use information</h2>
        <p>
          We use information to process CSV files, deliver paid downloads,
          prevent abuse, respond to support requests, maintain transaction
          records, improve the service, and comply with legal obligations. We
          do not sell personal information.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <p>
          Cloudflare provides hosting, security, database, and file storage.
          Stripe processes payments. These providers process information under
          their own terms and privacy policies and only receive information
          needed to provide their services.
        </p>
      </section>

      <section>
        <h2>Retention and deletion</h2>
        <p>
          We keep uploaded files, generated files, job records, and transaction
          records only as long as reasonably needed to deliver the service,
          provide support, prevent fraud, and meet legal or accounting duties.
          You may request deletion of uploaded and generated CSV files. Some
          payment or transaction records may need to be retained where required
          by law.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          We use access tokens, signed Stripe webhooks, bot protection, request
          limits, and restricted infrastructure access. No online service can
          guarantee absolute security, so do not upload secrets or data that is
          not needed for the CSV cleanup.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask to access, correct, or delete personal information linked
          to your email, subject to applicable law and records we must retain.
          You can also choose not to provide optional store URL information.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update this policy as the service changes. Material changes
          will be posted on this page with a new effective date.
        </p>
      </section>
    </LegalPage>
  );
}
