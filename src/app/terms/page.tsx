import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms for using ImageSEOFix and its Shopify CSV cleanup service.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      summary="These terms govern your use of ImageSEOFix, including the free storefront audit and paid Shopify CSV cleanup."
    >
      <section>
        <h2>Service and eligibility</h2>
        <p>
          ImageSEOFix is operated by AlphaDev LLC. You must be able to enter a
          binding contract and have permission to submit the store and product
          data you provide. By using or paying for the service, you agree to
          these terms.
        </p>
      </section>

      <section>
        <h2>What the service does</h2>
        <p>
          The paid starter service processes up to 100 product image rows from
          an official Shopify Products CSV and returns a cleaned CSV that updates
          Image Alt Text while preserving the source file structure. It does not
          log in to Shopify or import changes into your store.
        </p>
      </section>

      <section>
        <h2>Your responsibilities</h2>
        <ul>
          <li>Keep an untouched backup of the original Shopify export.</li>
          <li>Review all suggested text and Shopify&apos;s import preview.</li>
          <li>
            Confirm product handles, variants, images, language, claims, and
            accessibility meaning before completing an import.
          </li>
          <li>
            Do not upload passwords, payment card data, private customer data,
            malware, or content you do not have permission to process.
          </li>
        </ul>
      </section>

      <section>
        <h2>Fees and delivery</h2>
        <p>
          Prices are shown in US dollars before checkout. Payment is processed
          by Stripe. A paid download is unlocked after Stripe confirms payment.
          Taxes, if applicable, may be handled by Stripe or added as shown at
          checkout. Refunds are governed by our Refund Policy.
        </p>
      </section>

      <section>
        <h2>Your data and our software</h2>
        <p>
          You keep ownership of the data you upload. You grant us a limited
          right to process and store it only to operate, secure, support, and
          improve the service. ImageSEOFix and its software, branding, and site
          content remain the property of AlphaDev LLC and its licensors.
        </p>
      </section>

      <section>
        <h2>No ranking guarantee</h2>
        <p>
          Alt text quality can support accessibility and image understanding,
          but search ranking, traffic, sales, accessibility compliance, and
          platform approval depend on many factors. We do not guarantee those
          outcomes or provide legal, SEO, or accessibility certification.
        </p>
      </section>

      <section>
        <h2>Availability and liability</h2>
        <p>
          The service is provided on an as-available basis. To the fullest
          extent permitted by law, AlphaDev LLC is not liable for indirect,
          incidental, special, or consequential losses, lost profits, or store
          changes made without review. Our total liability for a claim related
          to a paid order will not exceed the amount you paid for that order.
        </p>
      </section>

      <section>
        <h2>Suspension and termination</h2>
        <p>
          We may limit or suspend access for abuse, security threats, unlawful
          use, payment fraud, or material violations of these terms. You may stop
          using the service at any time.
        </p>
      </section>

      <section>
        <h2>Governing law and changes</h2>
        <p>
          These terms are governed by the laws of Wyoming, United States,
          without regard to conflict-of-law rules. We may update these terms as
          the service changes; the effective date on this page identifies the
          current version.
        </p>
      </section>
    </LegalPage>
  );
}
