import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  CsvValidationError,
  parseCsv,
  processShopifyCsv,
} from '../src/lib/self-serve/csv.ts';

const fixturePath = new URL('./fixtures/shopify-products-export.csv', import.meta.url);

test('preserves the Shopify CSV shape while changing only Image Alt Text', async () => {
  const original = await readFile(fixturePath, 'utf8');
  const result = processShopifyCsv(original, 100);
  const before = parseCsv(original);
  const after = parseCsv(result.cleanedCsv);
  const altIndex = before[0].indexOf('Image Alt Text');

  assert.equal(after.length, before.length);
  assert.deepEqual(after[0], before[0]);
  assert.equal(result.stats.processedImageRows, 3);
  assert.equal(result.stats.changedRows, 2);
  assert.equal(result.stats.issueRows, 2);
  assert.equal(after[1][altIndex], 'Classic "Blue", Linen Shirt product image');
  assert.equal(after[2][altIndex], 'Classic "Blue", Linen Shirt product image');
  assert.equal(after[3][altIndex], before[3][altIndex]);

  for (let rowIndex = 1; rowIndex < before.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < before[0].length; columnIndex += 1) {
      if (columnIndex !== altIndex) {
        assert.equal(after[rowIndex][columnIndex], before[rowIndex][columnIndex]);
      }
    }
  }
});

test('rejects malformed quoted Shopify exports instead of silently changing rows', () => {
  assert.throws(
    () => parseCsv('Handle,Title\nshirt,"Unclosed title'),
    CsvValidationError
  );
});
