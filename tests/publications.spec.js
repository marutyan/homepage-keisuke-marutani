const { test, expect } = require('@playwright/test');
const configureEleventy = require('../.eleventy.js');

const TITLE = '混雑環境下の人物検出に向けた遮蔽を考慮したクエリ選択';

function getPublicationSortFilter() {
  let sortFilter;

  configureEleventy({
    addPassthroughCopy() {},
    addFilter(name, callback) {
      if (name === 'sortByYearDesc') sortFilter = callback;
    },
  });

  return sortFilter;
}

test('publication sort filter orders newest entries first', () => {
  const sortByYearDesc = getPublicationSortFilter();
  const source = [{ year: 2024 }, { year: 2026 }, { year: 2025 }];

  expect(sortByYearDesc(source).map(({ year }) => year)).toEqual([2026, 2025, 2024]);
  expect(source.map(({ year }) => year)).toEqual([2024, 2026, 2025]);
});

test('publication list renders structured data and supports multiple entries', async ({ page }, testInfo) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const list = page.locator('.publication-list');
  const items = page.locator('.publication-item');
  await expect(items).toHaveCount(1);
  await expect(items.first().locator('.publication-title')).toHaveText(TITLE);
  await expect(items.first().locator('.publication-authors')).toContainText('Keisuke Marutani');
  await expect(items.first().locator('.publication-venue')).toContainText('MIRU2026');
  await expect(items.first().locator('.publication-marker')).toBeVisible();

  await page.evaluate(() => {
    const publicationList = document.querySelector('.publication-list');
    const firstItem = publicationList.querySelector('.publication-item');
    const secondItem = firstItem.cloneNode(true);
    secondItem.dataset.publicationYear = '2025';
    secondItem.querySelector('.publication-title').textContent = '複数件表示確認用のPublication';
    publicationList.append(secondItem);
  });

  await expect(items).toHaveCount(2);
  await expect(items.nth(1)).toHaveCSS('border-top-style', 'solid');

  const firstBox = await items.first().boundingBox();
  const secondBox = await items.nth(1).boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height);

  const screenshotPath = testInfo.outputPath('publication-list-multiple.png');
  await list.screenshot({ path: screenshotPath });
  await testInfo.attach('publication-list-multiple', {
    path: screenshotPath,
    contentType: 'image/png',
  });
});
