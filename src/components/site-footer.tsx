import Link from 'next/link';

const supportEmail =
  process.env.NEXT_PUBLIC_LEAD_EMAIL?.trim() || 'lawxianzhao@gmail.com';

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <div>
          <p className="font-medium text-foreground">ImageSEOFix</p>
          <p className="mt-1">Operated by AlphaDev LLC.</p>
        </div>
        <nav aria-label="Legal and support" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link className="transition-colors hover:text-foreground" href="/terms">
            Terms
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/privacy">
            Privacy
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/refund-policy">
            Refund policy
          </Link>
          <a
            className="transition-colors hover:text-foreground"
            href={`mailto:${supportEmail}`}
          >
            Support
          </a>
        </nav>
      </div>
    </footer>
  );
}
