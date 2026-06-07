'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  Download,
  FileUp,
  Image as ImageIcon,
  Loader2,
  Mail,
  Sparkles,
  Store,
  TriangleAlert,
  WandSparkles,
} from 'lucide-react';
import { type FormEvent, useMemo, useRef, useState } from 'react';

type ImageRow = {
  source: string;
  currentAlt: string;
  productTitle: string;
  suggestedAlt: string;
  issues: string[];
};

const sampleCsv = `image_url,alt,title
https://cdn.shopify.com/s/files/linen-shirt-front.jpg,,White Linen Shirt
https://cdn.shopify.com/s/files/walnut-desk-lamp.png,lamp,Walnut Desk Lamp
https://cdn.shopify.com/s/files/black-running-shoes-side.jpg,Black running shoes side view,Black Running Shoes`;
const leadEmail = process.env.NEXT_PUBLIC_LEAD_EMAIL ?? 'hello@imageseofix.com';

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(value.trim());
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(value.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      value = '';
      continue;
    }

    value += char;
  }

  row.push(value.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function cleanWords(value: string) {
  return value
    .replace(/^https?:\/\/[^/]+\//, '')
    .replace(/\.[a-z0-9]{2,5}(\?.*)?$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b(img|image|photo|copy|final|front|side|main)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function createSuggestion(source: string, currentAlt: string, productTitle: string) {
  const title = productTitle || toTitleCase(cleanWords(source));
  const trimmedTitle = title.trim();
  const normalizedCurrent = currentAlt.trim();

  if (normalizedCurrent.length > 20 && trimmedTitle) {
    return normalizedCurrent;
  }

  if (!trimmedTitle) {
    return 'Product image with clear descriptive details';
  }

  return `${trimmedTitle} product image`;
}

function auditRow(source: string, currentAlt: string, productTitle: string): ImageRow {
  const issues: string[] = [];
  const alt = currentAlt.trim();

  if (!alt) {
    issues.push('Missing alt text');
  }
  if (alt && alt.length < 12) {
    issues.push('Too short');
  }
  if (alt.length > 125) {
    issues.push('Too long');
  }
  if (/\b(image|photo|picture)\b/i.test(alt)) {
    issues.push('Generic wording');
  }
  if (!source) {
    issues.push('Missing image URL');
  }

  return {
    source,
    currentAlt,
    productTitle,
    suggestedAlt: createSuggestion(source, currentAlt, productTitle),
    issues,
  };
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildRowsFromCsv(input: string): ImageRow[] {
  const rows = parseCsv(input);
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.toLowerCase());
  const imageIndex = headers.findIndex((header) =>
    ['image_url', 'image', 'src', 'url'].includes(header)
  );
  const altIndex = headers.findIndex((header) =>
    ['alt', 'alt_text', 'image_alt'].includes(header)
  );
  const titleIndex = headers.findIndex((header) =>
    ['title', 'product_title', 'name'].includes(header)
  );

  return rows.slice(1).map((row) =>
    auditRow(
      row[imageIndex >= 0 ? imageIndex : 0] ?? '',
      row[altIndex >= 0 ? altIndex : 1] ?? '',
      row[titleIndex >= 0 ? titleIndex : 2] ?? ''
    )
  );
}

function buildAuditSummary(rows: ImageRow[]) {
  const total = rows.length;
  const affected = rows.filter((row) => row.issues.length > 0).length;
  const missing = rows.filter((row) =>
    row.issues.includes('Missing alt text')
  ).length;
  const issueSummary = rows
    .filter((row) => row.issues.length > 0)
    .slice(0, 5)
    .map((row) => {
      const label = row.productTitle || cleanWords(row.source) || 'Untitled image';
      return `- ${label}: ${row.issues.join(', ')}`;
    })
    .join('\n');

  return [
    `Images audited: ${total}`,
    `Images with issues: ${affected}`,
    `Missing alt text: ${missing}`,
    '',
    issueSummary ? `Sample issues:\n${issueSummary}` : 'Sample issues: none',
  ].join('\n');
}

export function ImageSeoAuditor() {
  const [csv, setCsv] = useState(sampleCsv);
  const [rows, setRows] = useState<ImageRow[]>(() => buildRowsFromCsv(sampleCsv));
  const [isWorking, setIsWorking] = useState(false);
  const [email, setEmail] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [leadStatus, setLeadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const total = rows.length;
    const affected = rows.filter((row) => row.issues.length > 0).length;
    const missing = rows.filter((row) =>
      row.issues.includes('Missing alt text')
    ).length;

    return {
      total,
      affected,
      missing,
      score: total === 0 ? 0 : Math.round(((total - affected) / total) * 100),
    };
  }, [rows]);

  function runAudit(nextCsv = csv) {
    setIsWorking(true);
    window.setTimeout(() => {
      setRows(buildRowsFromCsv(nextCsv));
      setIsWorking(false);
    }, 180);
  }

  function onFileChange(file?: File) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setCsv(text);
      runAudit(text);
    };
    reader.readAsText(file);
  }

  function exportCsv() {
    const output = [
      ['image_url', 'current_alt', 'suggested_alt', 'issues'].join(','),
      ...rows.map((row) =>
        [
          row.source,
          row.currentAlt,
          row.suggestedAlt,
          row.issues.join('; '),
        ]
          .map(csvEscape)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([output], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'imageseofix-alt-text-audit.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function requestPrivateAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setLeadStatus('Add an email so we can reply with the audit plan.');
      return;
    }

    const subject = 'Private Shopify image SEO audit request';
    const body = [
      'Hi ImageSEOFix,',
      '',
      'I want help fixing product image alt text for my store.',
      '',
      `Reply email: ${email.trim()}`,
      `Store URL: ${storeUrl.trim() || 'Not provided yet'}`,
      '',
      buildAuditSummary(rows),
      '',
      'Please send the recommended next step and price.',
    ].join('\n');

    window.location.href = `mailto:${leadEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setLeadStatus('Opening your email app with the audit summary included.');
  }

  return (
    <section
      id="tool"
      className="border-border bg-background mx-auto grid w-full max-w-7xl scroll-mt-24 gap-6 border-y px-4 py-8 md:grid-cols-[0.95fr_1.05fr] md:px-6 lg:px-8"
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg">
            <ImageIcon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Free Shopify image SEO checker
            </p>
            <h2 className="text-2xl font-semibold">
              Audit alt text from a Shopify CSV
            </h2>
          </div>
        </div>

        <Textarea
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
          className="min-h-72 resize-y font-mono text-sm"
          aria-label="CSV input"
        />

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => runAudit()} disabled={isWorking}>
            {isWorking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <WandSparkles className="size-4" />
            )}
            Generate suggestions
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="size-4" />
            Upload CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={exportCsv}
            disabled={rows.length === 0}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => onFileChange(event.target.files?.[0])}
          />
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          Paste Shopify product image data with columns like image_url, alt, and
          title. The browser-only MVP highlights missing, short, long, or generic
          alt text and creates Shopify-ready suggestions without uploading data.
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="border-border bg-muted/30 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Images</p>
            <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
          </div>
          <div className="border-border bg-muted/30 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Issues</p>
            <p className="mt-2 text-3xl font-semibold">{stats.affected}</p>
          </div>
          <div className="border-border bg-muted/30 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="mt-2 text-3xl font-semibold">{stats.score}</p>
          </div>
        </div>

        <div className="border-border overflow-hidden rounded-lg border">
          <div className="bg-muted/40 grid grid-cols-[1fr_1fr_1fr] gap-3 border-b px-4 py-3 text-sm font-medium">
            <span>Image</span>
            <span>Suggested alt</span>
            <span>Status</span>
          </div>
          <div className="max-h-[480px] divide-y overflow-auto">
            {rows.map((row, index) => (
              <div
                key={`${row.source}-${index}`}
                className="grid grid-cols-[1fr_1fr_1fr] gap-3 px-4 py-3 text-sm"
              >
                <span className="truncate text-muted-foreground">
                  {row.productTitle || cleanWords(row.source) || 'Untitled'}
                </span>
                <span className="line-clamp-2">{row.suggestedAlt}</span>
                <div className="flex flex-wrap gap-2">
                  {row.issues.length === 0 ? (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="size-3" />
                      Ready
                    </Badge>
                  ) : (
                    row.issues.map((issue) => (
                      <Badge key={issue} variant="secondary" className="gap-1">
                        <TriangleAlert className="size-3" />
                        {issue}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border bg-muted/30 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="size-4 text-primary" />
            Upgrade path
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Paid plans will add private batch processing, better AI prompts by
            collection, edited history, and direct Shopify import/export.
          </p>
        </div>

        <form
          id="lead"
          onSubmit={requestPrivateAudit}
          className="border-border bg-background rounded-lg border p-4"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mail className="size-4 text-primary" />
            Want us to fix the full store?
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Send the current audit summary and get a private batch cleanup quote.
            Best for stores with 100+ product images or agency client work.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Work email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@store.com"
                className="border-input bg-background h-10 rounded-md border px-3 text-sm font-normal outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Store URL
              <div className="relative">
                <Store className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <input
                  value={storeUrl}
                  onChange={(event) => setStoreUrl(event.target.value)}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://store.com"
                  className="border-input bg-background h-10 w-full rounded-md border pl-9 pr-3 text-sm font-normal outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
              </div>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="submit">
              <Mail className="size-4" />
              Request private audit
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              No login yet. Your CSV stays in the browser unless you choose to
              email the summary.
            </p>
          </div>
          {leadStatus ? (
            <p className="mt-3 text-sm text-muted-foreground">{leadStatus}</p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
