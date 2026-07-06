'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { trackEvent } from '@/lib/analytics';
import {
  CheckCircle2,
  Copy,
  CreditCard,
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

type InputMode = 'store' | 'csv';

type ImageRow = {
  source: string;
  currentAlt: string;
  productTitle: string;
  suggestedAlt: string;
  issues: string[];
  csvRowIndex?: number;
};

type CsvSource = {
  headers: string[];
  dataRows: string[][];
  altIndex: number;
  importReady: boolean;
  safetyIssues: string[];
};

type CsvAuditResult = {
  rows: ImageRow[];
  productCount: number;
  totalProductCount: number;
  checkedProductCount: number;
  remainingProductCount: number;
  source?: CsvSource;
};

type StoreScanResponse = {
  error?: string;
  storeUrl?: string;
  scannedProducts?: number;
  rows?: Array<{
    source: string;
    currentAlt: string;
    productTitle: string;
  }>;
};

const sampleCsv = `Handle,Title,Image Src,Image Alt Text
blue-linen-shirt,Blue Linen Shirt,blue-linen-shirt-front.jpg,
walnut-desk-lamp,Walnut Desk Lamp,walnut-desk-lamp.png,lamp
ceramic-coffee-mug,Ceramic Coffee Mug,ceramic-coffee-mug-main.jpg,photo
black-running-shoes,Black Running Shoes,black-running-shoes-side.jpg,Black running shoes side view
leather-tote-bag,Leather Tote Bag,leather-tote-bag.jpg,`;
const leadEmail = process.env.NEXT_PUBLIC_LEAD_EMAIL ?? 'hello@imageseofix.com';
const paymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK ?? '';
const freeProductLimit = 5;
const starterCleanupPrice = '$19';
const starterCleanupScope = 'up to 100 product images';

const cleanupDeliverables = [
  'Cleaned Shopify Products CSV with reviewed Image Alt Text',
  'Import notes for Shopify preview and matching handles overwrite',
  'Short issue summary so the merchant knows what changed',
];

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
  let filename = value;

  try {
    const parsedUrl = new URL(value);
    filename = parsedUrl.pathname.split('/').filter(Boolean).pop() ?? value;
  } catch {
    filename = value.split(/[?#]/)[0].split('/').filter(Boolean).pop() ?? value;
  }

  return filename
    .replace(/\.[a-z0-9]{2,5}$/i, '')
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

  if (normalizedCurrent.length > 20 && normalizedCurrent.length <= 125) {
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

function normalizeHeader(header: string) {
  return header
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function findHeaderIndex(headers: string[], options: string[]) {
  return headers.findIndex((header) => options.includes(header));
}

function buildRowsFromCsv(input: string): CsvAuditResult {
  const parsedRows = parseCsv(input);
  if (parsedRows.length === 0) {
    return {
      rows: [],
      productCount: 0,
      totalProductCount: 0,
      checkedProductCount: 0,
      remainingProductCount: 0,
    };
  }

  const headers = parsedRows[0];
  const normalizedHeaders = headers.map(normalizeHeader);
  const imageIndex = findHeaderIndex(normalizedHeaders, [
    'image_src',
    'product_image_url',
    'image_url',
    'image',
    'src',
    'url',
    'variant_image_url',
  ]);
  const altIndex = findHeaderIndex(normalizedHeaders, [
    'image_alt_text',
    'alt',
    'alt_text',
    'image_alt',
  ]);
  const titleIndex = findHeaderIndex(normalizedHeaders, [
    'title',
    'product_title',
    'name',
  ]);
  const handleIndex = findHeaderIndex(normalizedHeaders, [
    'handle',
    'url_handle',
    'product_handle',
  ]);
  const option1NameIndex = findHeaderIndex(normalizedHeaders, [
    'option1_name',
    'option_1_name',
  ]);
  const option1ValueIndex = findHeaderIndex(normalizedHeaders, [
    'option1_value',
    'option_1_value',
  ]);

  const dataRows = parsedRows.slice(1);
  const productOrder: string[] = [];
  const productTitles = new Map<string, string>();
  const auditedRows: ImageRow[] = [];

  dataRows.forEach((row, rowIndex) => {
    const productKey =
      row[handleIndex] || row[titleIndex] || row[imageIndex] || `row-${rowIndex}`;
    const rowTitle = row[titleIndex] ?? '';

    if (!productOrder.includes(productKey)) {
      productOrder.push(productKey);
    }
    if (rowTitle) {
      productTitles.set(productKey, rowTitle);
    }

    if (productOrder.indexOf(productKey) >= freeProductLimit) {
      return;
    }

    const source = row[imageIndex] ?? '';
    if (!source) {
      return;
    }

    const auditedRow = auditRow(
      source,
      row[altIndex] ?? '',
      productTitles.get(productKey) ?? rowTitle
    );
    auditedRows.push({ ...auditedRow, csvRowIndex: rowIndex });
  });

  const checkedProductCount = Math.min(productOrder.length, freeProductLimit);

  const hasShopifyImageFields =
    handleIndex >= 0 && titleIndex >= 0 && imageIndex >= 0 && altIndex >= 0;
  const hasVariantIdentity = option1NameIndex >= 0 && option1ValueIndex >= 0;
  const hasNonPublicImageUrls =
    imageIndex >= 0 &&
    dataRows.some((row) => {
      const source = row[imageIndex]?.trim();
      return source ? !/^https?:\/\//i.test(source) : false;
    });
  const importReady =
    hasShopifyImageFields && hasVariantIdentity && !hasNonPublicImageUrls;
  const safetyIssues: string[] = [];

  if (hasShopifyImageFields && !hasVariantIdentity) {
    safetyIssues.push(
      'Missing Option1 Name and Option1 Value. Shopify can reject simplified image CSVs or change variants when those columns are absent.'
    );
  }
  if (altIndex >= 0 && !hasShopifyImageFields) {
    safetyIssues.push(
      'This looks useful for auditing, but it is not the full Shopify Products CSV format needed for safe import.'
    );
  }
  if (hasShopifyImageFields && hasNonPublicImageUrls) {
    safetyIssues.push(
      'Some image values are not public http/https URLs. Shopify CSV imports need publicly reachable image URLs, preferably from a Shopify export.'
    );
  }

  const source: CsvSource | undefined =
    altIndex >= 0
      ? {
          headers,
          dataRows,
          altIndex,
          importReady,
          safetyIssues,
        }
      : undefined;

  return {
    rows: auditedRows,
    productCount: checkedProductCount,
    totalProductCount: productOrder.length,
    checkedProductCount,
    remainingProductCount: Math.max(productOrder.length - checkedProductCount, 0),
    source,
  };
}

function buildAuditCsv(rows: ImageRow[]) {
  return [
    ['image_url', 'current_alt', 'suggested_alt', 'issues'].join(','),
    ...rows.map((row) =>
      [row.source, row.currentAlt, row.suggestedAlt, row.issues.join('; ')]
        .map(csvEscape)
        .join(',')
    ),
  ].join('\n');
}

function buildShopifyCsv(source: CsvSource | undefined, rows: ImageRow[]) {
  if (!source) {
    return buildAuditCsv(rows);
  }

  const outputRows = source.dataRows.map((row) => [...row]);
  rows.forEach((row) => {
    if (row.csvRowIndex === undefined) {
      return;
    }
    outputRows[row.csvRowIndex][source.altIndex] = row.suggestedAlt;
  });

  return [
    source.headers.map(csvEscape).join(','),
    ...outputRows.map((row) => row.map(csvEscape).join(',')),
  ].join('\n');
}

function isShopifyReadyCsv(source?: CsvSource) {
  if (!source) {
    return false;
  }
  return source.importReady;
}

function normalizeStoreUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function buildAuditSummary(
  rows: ImageRow[],
  mode: InputMode,
  storeUrl: string,
  productCounts: {
    checked: number;
    total: number;
    remaining: number;
  }
) {
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
    `Audit mode: ${mode === 'store' ? 'Store URL scan' : 'Shopify CSV'}`,
    `Store URL: ${storeUrl.trim() || 'Not provided yet'}`,
    `Products checked: ${productCounts.checked}`,
    `Products detected: ${productCounts.total}`,
    `Products remaining after free preview: ${productCounts.remaining}`,
    `Images audited: ${total}`,
    `Free product limit: ${freeProductLimit}`,
    `Images with issues: ${affected}`,
    `Missing alt text: ${missing}`,
    '',
    issueSummary ? `Sample issues:\n${issueSummary}` : 'Sample issues: none',
  ].join('\n');
}

export function ImageSeoAuditor() {
  const [mode, setMode] = useState<InputMode>('store');
  const [scanStoreUrl, setScanStoreUrl] = useState('');
  const [csv, setCsv] = useState(sampleCsv);
  const [rows, setRows] = useState<ImageRow[]>([]);
  const [isWorking, setIsWorking] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scannedProducts, setScannedProducts] = useState(0);
  const [email, setEmail] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [leadStatus, setLeadStatus] = useState('');
  const [copiedRow, setCopiedRow] = useState('');
  const [csvSource, setCsvSource] = useState<CsvAuditResult['source']>();
  const [totalProducts, setTotalProducts] = useState(0);
  const [remainingProducts, setRemainingProducts] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasShopifyReadyCsv = isShopifyReadyCsv(csvSource);
  const hasRemainingProducts = remainingProducts > 0;
  const csvSafetyIssues = csvSource?.safetyIssues ?? [];

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
      const result = buildRowsFromCsv(nextCsv);
      setRows(result.rows);
      setScannedProducts(result.checkedProductCount);
      setTotalProducts(result.totalProductCount);
      setRemainingProducts(result.remainingProductCount);
      setCsvSource(result.source);
      trackEvent('csv_generate', {
        imageRows: result.rows.length,
        issueCount: result.rows.filter((row) => row.issues.length > 0).length,
        totalProducts: result.totalProductCount,
        checkedProducts: result.checkedProductCount,
      });
      setIsWorking(false);
    }, 180);
  }

  async function runStoreScan() {
    const normalizedStoreUrl = normalizeStoreUrl(scanStoreUrl);
    if (!normalizedStoreUrl) {
      setScanError('Enter a public Shopify store URL to scan.');
      trackEvent('store_scan_error', { reason: 'missing_url' });
      return;
    }

    setIsWorking(true);
    setScanError('');
    setScannedProducts(0);
    setTotalProducts(0);
    setRemainingProducts(0);
    trackEvent('store_scan_submit', { mode: 'store' });

    try {
      const response = await fetch('/store-scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ storeUrl: normalizedStoreUrl }),
      });
      const result = (await response.json()) as StoreScanResponse;

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Unable to scan this store.');
      }

      setRows(
        (result.rows ?? []).map((row) =>
          auditRow(row.source, row.currentAlt, row.productTitle)
        )
      );
      setCsvSource(undefined);
      setStoreUrl(result.storeUrl ?? normalizedStoreUrl);
      setScannedProducts(result.scannedProducts ?? 0);
      setTotalProducts(result.scannedProducts ?? 0);
      setRemainingProducts(0);
      trackEvent('store_scan_success', {
        productCount: result.scannedProducts ?? 0,
        imageRows: result.rows?.length ?? 0,
      });
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : 'Unable to scan this store right now.';
      const friendlyMessage =
        /fetch failed|No public Shopify product pages|password/i.test(rawMessage)
          ? 'This storefront could not be scanned from a public URL. If it is password-protected or unpublished, export Products CSV from Shopify and use CSV fallback.'
          : rawMessage;

      setRows([]);
      setCsvSource(undefined);
      setStoreUrl(normalizedStoreUrl);
      setScannedProducts(0);
      setTotalProducts(0);
      setRemainingProducts(0);
      setScanError(friendlyMessage);
      trackEvent('store_scan_error', {
        reason: rawMessage.slice(0, 80),
      });
    } finally {
      setIsWorking(false);
    }
  }

  function onFileChange(file?: File) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setCsv(text);
      trackEvent('csv_upload', { bytes: text.length });
      runAudit(text);
    };
    reader.readAsText(file);
  }

  function exportCsv() {
    trackEvent('csv_export', {
      mode,
      imageRows: rows.length,
      issueCount: rows.filter((row) => row.issues.length > 0).length,
    });

    const output = hasShopifyReadyCsv
      ? buildShopifyCsv(csvSource, rows)
      : buildAuditCsv(rows);

    const blob = new Blob([output], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = hasShopifyReadyCsv
      ? hasRemainingProducts
        ? 'imageseofix-shopify-preview-5-products.csv'
        : 'imageseofix-shopify-products-cleaned.csv'
      : 'imageseofix-alt-text-audit.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copySuggestion(row: ImageRow, index: number) {
    const key = `${row.source}-${index}`;
    try {
      await navigator.clipboard.writeText(row.suggestedAlt);
      setCopiedRow(key);
      window.setTimeout(() => setCopiedRow(''), 1400);
      trackEvent('manual_fix_copy', {
        mode,
        issueCount: row.issues.length,
      });
    } catch {
      setLeadStatus('Copy failed. Select the suggested alt text manually.');
    }
  }

  function buildCleanupRequestHref(intent: 'starter' | 'quote') {
    const subject =
      intent === 'starter'
        ? 'Start $19 Shopify alt text cleanup'
        : 'Full Shopify alt text cleanup quote';
    const body = [
      'Hi ImageSEOFix,',
      '',
      intent === 'starter'
        ? `I want the ${starterCleanupPrice} Starter cleanup for ${starterCleanupScope}.`
        : 'I want a full-store Shopify image alt text cleanup quote.',
      '',
      `Reply email: ${email.trim() || 'Please reply to this email'}`,
      `Store URL: ${storeUrl.trim() || scanStoreUrl.trim() || 'Not provided yet'}`,
      'I will send the full Shopify Products CSV export after payment or scope confirmation.',
      'Delivery needed: cleaned import-ready CSV, change summary, and Shopify import notes.',
      '',
      buildAuditSummary(rows, mode, storeUrl || scanStoreUrl, {
        checked: scannedProducts,
        total: totalProducts,
        remaining: remainingProducts,
      }),
      '',
      'Please send the payment link and next step.',
    ].join('\n');

    return `mailto:${leadEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  function requestPrivateAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setLeadStatus('Add an email so we can reply with the audit plan.');
      trackEvent('lead_request_missing_email', {
        mode,
        imageRows: rows.length,
      });
      return;
    }

    trackEvent('lead_request_submit', {
      mode,
      imageRows: rows.length,
      issueCount: rows.filter((row) => row.issues.length > 0).length,
      productCount: scannedProducts,
    });

    const subject = 'Full Shopify alt text cleanup quote';
    const body = [
      'Hi ImageSEOFix,',
      '',
      'I want a full-store Shopify image alt text cleanup quote.',
      '',
      `Reply email: ${email.trim()}`,
      `Store URL: ${storeUrl.trim() || 'Not provided yet'}`,
      `Starter package: ${starterCleanupPrice} for ${starterCleanupScope}`,
      'Preferred payment: Stripe, PayPal, or invoice',
      'Catalog size: Please estimate after reviewing the audit summary and Shopify Products CSV.',
      'Expected delivery: cleaned Shopify Products CSV, change summary, and Shopify import notes.',
      '',
      buildAuditSummary(rows, mode, storeUrl, {
        checked: scannedProducts,
        total: totalProducts,
        remaining: remainingProducts,
      }),
      '',
      'Please send the recommended next step, fixed price, and payment link.',
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
      <div className="min-w-0 space-y-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg">
            <ImageIcon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Free Shopify image SEO checker
            </p>
            <h2 className="text-2xl font-semibold">
              Scan the first 5 Shopify products free
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 rounded-lg border bg-muted/30 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode('store')}
            className={`rounded-md px-3 py-2 transition-colors ${
              mode === 'store' ? 'bg-background shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Store URL
          </button>
          <button
            type="button"
            onClick={() => setMode('csv')}
            className={`rounded-md px-3 py-2 transition-colors ${
              mode === 'csv' ? 'bg-background shadow-sm' : 'text-muted-foreground'
            }`}
          >
            CSV fallback
          </button>
        </div>

        {mode === 'store' ? (
          <div className="space-y-4">
            <label className="grid gap-2 text-sm font-medium">
              Shopify store URL
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={scanStoreUrl}
                  onChange={(event) => setScanStoreUrl(event.target.value)}
                  type="url"
                  inputMode="url"
                  placeholder="https://your-store.com"
                  className="border-input bg-background h-11 min-w-0 flex-1 rounded-md border px-3 text-sm font-normal outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
                <Button type="button" size="lg" onClick={runStoreScan} disabled={isWorking}>
                  {isWorking ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <WandSparkles className="size-4" />
                  )}
                  Scan 5 products
                </Button>
              </div>
            </label>
            <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              Free scans are capped at the first {freeProductLimit} products to
              keep the service fast and low-cost. Larger stores unlock more
              products with Growth or Agency plans. The scanner reads public
              storefront HTML only; it does not download images or write to
              Shopify. If your store is password-protected or unpublished, export
              Products CSV from Shopify and use CSV fallback.
            </div>
            {scanError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm leading-6 text-destructive">
                {scanError}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              className="min-h-72 resize-y font-mono text-sm"
              aria-label="CSV input"
            />
            <p className="text-sm leading-6 text-muted-foreground">
              Upload the full Products CSV exported from Shopify Admin. Keep
              every option, variant, image, and market column in place; handmade
              four-column CSVs are audit-only and will not be treated as safe
              Shopify imports. Free CSV checks only update the first 5 products
              and preserve the original CSV shape.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {mode === 'csv' ? (
            <>
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
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={exportCsv}
            disabled={rows.length === 0}
          >
            <Download className="size-4" />
            {hasShopifyReadyCsv
              ? hasRemainingProducts
                ? 'Export 5-product preview'
                : 'Export Shopify CSV'
              : 'Export audit CSV'}
          </Button>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => onFileChange(event.target.files?.[0])}
          />
        </div>
      </div>

      <div className="min-w-0 space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border-border bg-muted/30 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Products checked</p>
            <p className="mt-2 text-3xl font-semibold">{scannedProducts}</p>
            {totalProducts > scannedProducts ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {totalProducts} detected
              </p>
            ) : null}
          </div>
          <div className="border-border bg-muted/30 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Images</p>
            <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
          </div>
          <div className="border-border bg-muted/30 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Issues</p>
            <p className="mt-2 text-3xl font-semibold">{stats.affected}</p>
          </div>
          <div className="border-border bg-muted/30 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="mt-2 text-3xl font-semibold">{remainingProducts}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              after free preview
            </p>
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="size-4 text-primary" />
                Next step: review, copy, or export preview
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use Copy for a few manual fixes in Shopify Admin, or export a
                Shopify CSV preview that keeps your original columns and updates
                Image Alt Text for the checked rows. Keep a backup of your
                original Shopify product CSV before importing changes.
              </p>
              {hasShopifyReadyCsv ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Shopify-ready CSV detected. This free export updates{' '}
                  {scannedProducts} product
                  {scannedProducts === 1 ? '' : 's'}
                  {hasRemainingProducts
                    ? ` and leaves ${remainingProducts} product${
                        remainingProducts === 1 ? '' : 's'
                      } for a paid full-catalog cleanup.`
                    : ' and is ready for a careful Shopify import test.'}
                </p>
              ) : null}
              {csvSafetyIssues.length > 0 ? (
                <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm leading-6 text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-amber-900">
                    <TriangleAlert className="size-4" />
                    Audit-only CSV detected
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {csvSafetyIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                  <p className="mt-2">
                    For an import-ready file, export Products from Shopify,
                    upload that full CSV here, and do not delete the option or
                    variant columns before importing the cleaned file.
                  </p>
                </div>
              ) : null}
              {hasShopifyReadyCsv ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Shopify import tip: select Overwrite products with matching
                  handles only for this cleaned copy, then review Shopify&apos;s
                  preview before clicking Import products.
                </p>
              ) : null}
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CreditCard className="size-4 text-emerald-700" />
                Start a paid cleanup
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The free scan checks the first {freeProductLimit} products. The
                Starter cleanup is {starterCleanupPrice} for{' '}
                {starterCleanupScope}.
                {hasRemainingProducts
                  ? ` This file has ${remainingProducts} more product${
                      remainingProducts === 1 ? '' : 's'
                    } waiting for full cleanup.`
                  : ' For larger catalogs, send the audit summary and your Shopify Products CSV.'}{' '}
                We work from your official Shopify Products CSV and return a
                cleaned CSV you can test in Shopify preview.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {cleanupDeliverables.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button asChild size="sm">
                  <a
                    href="#lead"
                    onClick={() =>
                      trackEvent('full_store_fix_cta_click', {
                        mode,
                        imageRows: rows.length,
                        issueCount: rows.filter((row) => row.issues.length > 0)
                          .length,
                      })
                    }
                  >
                    Request full-store fix
                  </a>
                </Button>
                {paymentLink ? (
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={paymentLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        trackEvent('payment_link_click', {
                          mode,
                          imageRows: rows.length,
                        })
                      }
                    >
                      Pay {starterCleanupPrice} starter cleanup
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={buildCleanupRequestHref('starter')}
                      onClick={() =>
                        trackEvent('full_store_fix_cta_click', {
                          mode,
                          imageRows: rows.length,
                          issueCount: rows.filter((row) => row.issues.length > 0)
                            .length,
                        })
                      }
                    >
                      Request {starterCleanupPrice} payment link
                    </a>
                  </Button>
                )}
                <span className="text-xs leading-5 text-muted-foreground">
                  No app install. No Shopify login. Official CSV export only.
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="border-border overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <div className="bg-muted/40 grid min-w-[780px] grid-cols-[1fr_1fr_0.8fr_0.7fr] gap-3 border-b px-4 py-3 text-sm font-medium">
            <span>Product / image row</span>
            <span>Current alt</span>
            <span>Suggested alt</span>
            <span>Status</span>
            </div>
            <div className="max-h-[480px] min-w-[780px] divide-y overflow-auto">
            {rows.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm leading-6 text-muted-foreground">
                Enter a public Shopify store URL and scan the first 5 products to
                see real storefront image alt text issues.
              </div>
            ) : (
              rows.map((row, index) => (
                <div
                  key={`${row.source}-${index}`}
                  className="grid grid-cols-[1fr_1fr_0.8fr_0.7fr] gap-3 px-4 py-3 text-sm"
                >
                  <span className="truncate text-muted-foreground">
                    {row.productTitle || cleanWords(row.source) || 'Untitled'}
                  </span>
                  <span className="line-clamp-2 text-muted-foreground">
                    {row.currentAlt || 'Missing'}
                  </span>
                  <div className="space-y-2">
                    <span className="line-clamp-2">{row.suggestedAlt}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => copySuggestion(row, index)}
                    >
                      <Copy className="size-3.5" />
                      {copiedRow === `${row.source}-${index}` ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
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
              ))
            )}
            </div>
          </div>
        </div>

        <div className="border-border bg-muted/30 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="size-4 text-primary" />
            Upgrade path
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Free scans show the first {freeProductLimit} products. The paid
            delivery path is a reviewed Shopify Products CSV that keeps your
            original rows and updates Image Alt Text for the full catalog.
            Growth later unlocks larger self-serve scans, while Agency is for
            multi-store cleanup and human-reviewed delivery.
          </p>
        </div>

        <form
          id="lead"
          onSubmit={requestPrivateAudit}
          className="border-border bg-background rounded-lg border p-4"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mail className="size-4 text-primary" />
            Get the full store fixed
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Send the current audit summary and request the {starterCleanupPrice}{' '}
            Starter cleanup for {starterCleanupScope}, or ask for a fixed quote
            on larger catalogs. We review the file, update Image Alt Text, and
            send back an import-ready CSV.
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
              Request cleanup quote
            </Button>
            {paymentLink ? (
              <Button asChild variant="outline">
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackEvent('payment_link_click', {
                      mode,
                      imageRows: rows.length,
                    })
                  }
                >
                  <CreditCard className="size-4" />
                  Pay {starterCleanupPrice} starter cleanup
                </a>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <a href={buildCleanupRequestHref('starter')}>
                  <CreditCard className="size-4" />
                  Request payment link
                </a>
              </Button>
            )}
            <p className="text-xs leading-5 text-muted-foreground">
              No login yet. Your CSV stays in the browser unless you choose to
              email the summary. Use Stripe Payment Link when available; larger
              catalogs get a quote before payment.
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
