import Link from 'next/link';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/site-footer';

const supportEmail =
  process.env.NEXT_PUBLIC_LEAD_EMAIL?.trim() || 'lawxianzhao@gmail.com';

type LegalPageProps = {
  title: string;
  summary: string;
  children: ReactNode;
};

export function LegalPage({ title, summary, children }: LegalPageProps) {
  return (
    <main className="min-h-dvh bg-background">
      <article className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <Link
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          href="/"
        >
          ImageSEOFix
        </Link>
        <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">{summary}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Effective July 10, 2026
        </p>

        <div className="mt-10 space-y-9 text-sm leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-2">
          {children}
        </div>

        <div className="mt-12 rounded-lg border bg-muted/25 p-5 text-sm leading-6 text-muted-foreground">
          Questions about this policy can be sent to{' '}
          <a className="font-medium text-primary" href={`mailto:${supportEmail}`}>
            {supportEmail}
          </a>
          .
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
