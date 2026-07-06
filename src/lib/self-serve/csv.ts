export type SelfServeCsvStats = {
  totalRows: number;
  totalImageRows: number;
  processedImageRows: number;
  changedRows: number;
  issueRows: number;
  detectedProducts: number;
  warnings: string[];
};

export type SelfServeCsvResult = {
  cleanedCsv: string;
  stats: SelfServeCsvStats;
};

export class CsvValidationError extends Error {
  status = 422;

  constructor(message: string) {
    super(message);
    this.name = 'CsvValidationError';
  }
}

type HeaderIndexes = {
  handleIndex: number;
  titleIndex: number;
  imageIndex: number;
  altIndex: number;
  option1NameIndex: number;
  option1ValueIndex: number;
};

const requiredHeaderHelp =
  'Upload the full Shopify Products CSV export. It must include Handle, Title, Image Src, Image Alt Text, Option1 Name, and Option1 Value columns.';

export function parseCsv(input: string): string[][] {
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

  if (inQuotes) {
    throw new CsvValidationError('The CSV has an open quote. Export a fresh Shopify Products CSV and upload it again.');
  }

  return rows;
}

export function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function normalizeHeader(header: string) {
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

function detectHeaders(headers: string[]): HeaderIndexes {
  const normalizedHeaders = headers.map(normalizeHeader);

  return {
    handleIndex: findHeaderIndex(normalizedHeaders, [
      'handle',
      'url_handle',
      'product_handle',
    ]),
    titleIndex: findHeaderIndex(normalizedHeaders, [
      'title',
      'product_title',
      'name',
    ]),
    imageIndex: findHeaderIndex(normalizedHeaders, [
      'image_src',
      'product_image_url',
      'image_url',
    ]),
    altIndex: findHeaderIndex(normalizedHeaders, [
      'image_alt_text',
      'alt',
      'alt_text',
      'image_alt',
    ]),
    option1NameIndex: findHeaderIndex(normalizedHeaders, [
      'option1_name',
      'option_1_name',
    ]),
    option1ValueIndex: findHeaderIndex(normalizedHeaders, [
      'option1_value',
      'option_1_value',
    ]),
  };
}

function ensureShopifyImportShape(indexes: HeaderIndexes) {
  const missing: string[] = [];

  if (indexes.handleIndex < 0) {
    missing.push('Handle');
  }
  if (indexes.titleIndex < 0) {
    missing.push('Title');
  }
  if (indexes.imageIndex < 0) {
    missing.push('Image Src');
  }
  if (indexes.altIndex < 0) {
    missing.push('Image Alt Text');
  }
  if (indexes.option1NameIndex < 0) {
    missing.push('Option1 Name');
  }
  if (indexes.option1ValueIndex < 0) {
    missing.push('Option1 Value');
  }

  if (missing.length > 0) {
    throw new CsvValidationError(`${requiredHeaderHelp} Missing: ${missing.join(', ')}.`);
  }
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
    .replace(/\b(img|image|photo|copy|final|main)\b/gi, ' ')
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
  const trimmedAlt = currentAlt.trim();

  if (trimmedAlt.length > 20 && trimmedAlt.length <= 125) {
    return trimmedAlt;
  }

  const title = productTitle.trim() || toTitleCase(cleanWords(source));
  if (!title) {
    return 'Product image with clear descriptive details';
  }

  return `${title} product image`;
}

function hasIssue(source: string, currentAlt: string) {
  const alt = currentAlt.trim();

  return (
    !source.trim() ||
    !alt ||
    alt.length < 12 ||
    alt.length > 125 ||
    /\b(image|photo|picture)\b/i.test(alt)
  );
}

function isPublicImageUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function serializeCsv(headers: string[], rows: string[][]) {
  return [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map((value) => csvEscape(value ?? '')).join(',')),
  ].join('\n');
}

export function processShopifyCsv(input: string, maxImageRows = 100): SelfServeCsvResult {
  const parsedRows = parseCsv(input);
  if (parsedRows.length < 2) {
    throw new CsvValidationError('The CSV is empty. Export Products CSV from Shopify and upload the full file.');
  }

  const headers = parsedRows[0];
  const indexes = detectHeaders(headers);
  ensureShopifyImportShape(indexes);

  const dataRows = parsedRows.slice(1).map((row) => [...row]);
  const productTitles = new Map<string, string>();
  const products = new Set<string>();
  const warnings: string[] = [];
  let totalImageRows = 0;
  let processedImageRows = 0;
  let changedRows = 0;
  let issueRows = 0;

  dataRows.forEach((row, rowIndex) => {
    const handle =
      row[indexes.handleIndex]?.trim() ||
      row[indexes.titleIndex]?.trim() ||
      `row-${rowIndex + 2}`;
    const title = row[indexes.titleIndex]?.trim() ?? '';

    products.add(handle);
    if (title) {
      productTitles.set(handle, title);
    }
  });

  dataRows.forEach((row, rowIndex) => {
    const source = row[indexes.imageIndex]?.trim() ?? '';
    if (!source) {
      return;
    }

    totalImageRows += 1;

    if (!isPublicImageUrl(source)) {
      warnings.push(`Row ${rowIndex + 2} has a non-public image URL. Shopify imports need http or https image URLs.`);
      return;
    }

    if (processedImageRows >= maxImageRows) {
      return;
    }

    const handle =
      row[indexes.handleIndex]?.trim() ||
      row[indexes.titleIndex]?.trim() ||
      `row-${rowIndex + 2}`;
    const currentAlt = row[indexes.altIndex] ?? '';
    const title =
      row[indexes.titleIndex]?.trim() ||
      productTitles.get(handle) ||
      toTitleCase(cleanWords(source));
    const suggestion = createSuggestion(source, currentAlt, title);

    processedImageRows += 1;
    if (hasIssue(source, currentAlt)) {
      issueRows += 1;
    }
    if (suggestion !== currentAlt.trim()) {
      changedRows += 1;
      row[indexes.altIndex] = suggestion;
    }
  });

  if (totalImageRows > maxImageRows) {
    warnings.push(`Processed the first ${maxImageRows} product image rows. Upgrade scope later for larger catalogs.`);
  }

  const uniqueWarnings = [...new Set(warnings)].slice(0, 12);

  return {
    cleanedCsv: serializeCsv(headers, dataRows),
    stats: {
      totalRows: dataRows.length,
      totalImageRows,
      processedImageRows,
      changedRows,
      issueRows,
      detectedProducts: products.size,
      warnings: uniqueWarnings,
    },
  };
}
