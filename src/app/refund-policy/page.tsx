import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Refund eligibility and request process for ImageSEOFix orders.',
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      summary="We want the paid CSV cleanup to deliver the specific file and scope shown before checkout. This policy explains when a refund is available."
    >
      <section>
        <h2>Eligible requests</h2>
        <p>
          Contact us within 7 days of purchase if you were charged more than
          once for the same job, the paid download cannot be delivered because
          of an ImageSEOFix error, or the delivered file is unreadable or does
          not include the paid scope shown at checkout. We may first try to
          repair or redeliver the file promptly.
        </p>
      </section>

      <section>
        <h2>What is not refundable</h2>
        <ul>
          <li>A change of mind after a usable cleaned CSV was downloaded.</li>
          <li>
            Problems caused by editing the source or cleaned CSV outside
            ImageSEOFix, importing without review, or not keeping a backup.
          </li>
          <li>
            Requests based on SEO rankings, traffic, sales, or other outcomes
            that the service does not guarantee.
          </li>
          <li>
            Work beyond the displayed starter limit of 100 product image rows.
          </li>
        </ul>
        <p>
          These limits do not reduce any non-waivable rights available under
          applicable consumer law.
        </p>
      </section>

      <section>
        <h2>How to request a refund</h2>
        <p>
          Email support from the address used at checkout and include the job ID,
          purchase date, and a short description of the problem. Do not attach a
          CSV containing information you do not want included in the support
          request.
        </p>
      </section>

      <section>
        <h2>Processing</h2>
        <p>
          Approved refunds are returned to the original payment method through
          Stripe. The time for funds to appear depends on Stripe, the card
          network, and your bank. We will confirm when the refund has been
          submitted.
        </p>
      </section>
    </LegalPage>
  );
}
