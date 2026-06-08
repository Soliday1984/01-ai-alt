import { NextResponse } from 'next/server';

const maxProducts = 5;
const maxImagesPerProduct = 3;
const fetchTimeoutMs = 5000;
const maxHtmlBytes = 700_000;
const scannerUserAgent =
  'ImageSEOFixBot/0.1 (+https://imageseofix.com)';

type ScanRow = {
  source: string;
  currentAlt: string;
  productTitle: string;
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase();

  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host === '0.0.0.0' ||
    host.startsWith('127.') ||
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host === '::1' ||
    host.startsWith('fc') ||
    host.startsWith('fd')
  );
}

function normalizeStoreUrl(input: unknown) {
  if (typeof input !== 'string') {
    throw new Error('Store URL is required.');
  }

  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 300) {
    throw new Error('Enter a valid public Shopify store URL.');
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(withProtocol);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http and https store URLs are supported.');
  }
  if (url.username || url.password || isBlockedHost(url.hostname)) {
    throw new Error('Enter a public store URL.');
  }

  return new URL(url.origin);
}

async function fetchText(url: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xml,text/xml;q=0.9,*/*;q=0.8',
        'User-Agent': scannerUserAgent,
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with ${response.status}.`);
    }

    const text = await response.text();
    return text.slice(0, maxHtmlBytes);
  } finally {
    clearTimeout(timeout);
  }
}

function sameOriginUrl(value: string, origin: URL) {
  try {
    const url = new URL(decodeHtml(value), origin);
    if (url.origin !== origin.origin) {
      return null;
    }
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

function uniqueProductUrls(values: Array<URL | null>) {
  const seen = new Set<string>();
  const products: URL[] = [];

  for (const value of values) {
    if (!value || !value.pathname.includes('/products/')) {
      continue;
    }

    value.search = '';
    const key = value.toString();
    if (!seen.has(key)) {
      seen.add(key);
      products.push(value);
    }
    if (products.length >= maxProducts) {
      break;
    }
  }

  return products;
}

function extractLocs(xml: string, origin: URL) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) =>
    sameOriginUrl(match[1], origin)
  );
}

function extractProductLinks(html: string, origin: URL) {
  return [...html.matchAll(/href=["']([^"']*\/products\/[^"']+)["']/gi)].map(
    (match) => sameOriginUrl(match[1], origin)
  );
}

async function discoverProductUrls(origin: URL) {
  const sitemapUrl = new URL('/sitemap.xml', origin);

  try {
    const sitemap = await fetchText(sitemapUrl);
    const locs = extractLocs(sitemap, origin);
    const productSitemap = locs.find((loc) =>
      loc?.pathname.includes('sitemap_products')
    );

    if (productSitemap) {
      const productXml = await fetchText(productSitemap);
      const productUrls = uniqueProductUrls(extractLocs(productXml, origin));
      if (productUrls.length > 0) {
        return productUrls;
      }
    }

    const productUrls = uniqueProductUrls(locs);
    if (productUrls.length > 0) {
      return productUrls;
    }
  } catch {
    // Fall back to homepage link discovery below.
  }

  const home = await fetchText(origin);
  return uniqueProductUrls(extractProductLinks(home, origin));
}

function getAttr(tag: string, attr: string) {
  const pattern = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i');
  return decodeHtml(tag.match(pattern)?.[1] ?? '');
}

function getImageSrc(tag: string, productUrl: URL) {
  const src =
    getAttr(tag, 'src') ||
    getAttr(tag, 'data-src') ||
    getAttr(tag, 'data-original') ||
    getAttr(tag, 'data-master') ||
    getAttr(tag, 'data-zoom');
  const srcset = getAttr(tag, 'srcset') || getAttr(tag, 'data-srcset');
  const firstSrcsetUrl = srcset.split(',')[0]?.trim().split(/\s+/)[0] ?? '';
  const raw = src || firstSrcsetUrl;

  if (!raw || raw.startsWith('data:')) {
    return '';
  }

  try {
    return new URL(raw, productUrl).toString();
  } catch {
    return raw;
  }
}

function extractTitle(html: string) {
  const metaTitle =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

  return decodeHtml(
    (metaTitle || h1 || title || 'Untitled product').replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ');
}

function extractImageRows(productUrl: URL, html: string): ScanRow[] {
  const productTitle = extractTitle(html);
  const rows: ScanRow[] = [];
  const seen = new Set<string>();
  const tags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);

  for (const tag of tags) {
    const source = getImageSrc(tag, productUrl);
    if (!source || seen.has(source)) {
      continue;
    }

    const lowerSource = source.toLowerCase();
    const lowerTag = tag.toLowerCase();
    const looksProductRelated =
      lowerSource.includes('cdn.shopify') ||
      lowerSource.includes('/products/') ||
      lowerSource.includes('/files/') ||
      lowerTag.includes('product') ||
      lowerTag.includes('media');

    if (!looksProductRelated) {
      continue;
    }

    seen.add(source);
    rows.push({
      source,
      currentAlt: getAttr(tag, 'alt'),
      productTitle,
    });

    if (rows.length >= maxImagesPerProduct) {
      break;
    }
  }

  if (rows.length === 0) {
    rows.push({
      source: productUrl.toString(),
      currentAlt: '',
      productTitle,
    });
  }

  return rows;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const origin = normalizeStoreUrl(body?.storeUrl);
    const productUrls = await discoverProductUrls(origin);

    if (productUrls.length === 0) {
      return jsonResponse(
        {
          error:
            'No public Shopify product pages were found. Try a public storefront URL or use CSV fallback.',
        },
        422
      );
    }

    const productHtml = await Promise.allSettled(
      productUrls.map(async (url) => ({
        url,
        html: await fetchText(url),
      }))
    );
    const rows = productHtml.flatMap((result) =>
      result.status === 'fulfilled'
        ? extractImageRows(result.value.url, result.value.html)
        : []
    );

    return jsonResponse({
      storeUrl: origin.toString(),
      productLimit: maxProducts,
      scannedProducts: productUrls.length,
      productUrls: productUrls.map((url) => url.toString()),
      rows,
    });
  } catch (error) {
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to scan this store right now.',
      },
      400
    );
  }
}
