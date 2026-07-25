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

test('publication list renders bibliography rows and supports multiple entries', async ({ page }, testInfo) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({
    content: `
      .animate-in {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    `,
  });

  const list = page.locator('.publication-list');
  const items = page.locator('.publication-item');
  const firstItem = items.first();

  await expect(items).toHaveCount(1);
  await expect(firstItem.locator('.publication-year')).toHaveText('2026');
  await expect(firstItem.locator('.publication-title')).toHaveText(TITLE);
  await expect(firstItem.locator('.publication-authors')).toContainText('Keisuke Marutani');
  await expect(firstItem.locator('.publication-venue')).toContainText('MIRU2026');
  await expect(firstItem.locator('.publication-marker')).toHaveCount(0);
  await expect(firstItem).toHaveCSS('border-bottom-style', 'solid');

  const selfAuthor = firstItem.locator('.publication-author--self');
  const coauthor = firstItem.locator('.publication-author:not(.publication-author--self)').first();
  await expect(selfAuthor).toHaveText('Keisuke Marutani');
  await expect(selfAuthor).toHaveCSS('font-weight', '700');
  await expect(selfAuthor).toHaveCSS('text-decoration-line', 'underline');

  const selfColor = await selfAuthor.evaluate((element) => getComputedStyle(element).color);
  const coauthorColor = await coauthor.evaluate((element) => getComputedStyle(element).color);
  expect(selfColor).not.toBe(coauthorColor);

  await page.evaluate(() => {
    const publicationList = document.querySelector('.publication-list');
    const firstPublication = publicationList.querySelector('.publication-item');
    const secondPublication = firstPublication.cloneNode(true);
    secondPublication.dataset.publicationYear = '2025';
    secondPublication.querySelector('.publication-year').textContent = '2025';
    secondPublication.querySelector('.publication-year').setAttribute('datetime', '2025');
    secondPublication.querySelector('.publication-title').textContent = '複数件表示確認用のPublication';
    publicationList.append(secondPublication);
  });

  await expect(items).toHaveCount(2);
  await expect(items.nth(1).locator('.publication-year')).toHaveText('2025');
  await expect(items.nth(1)).toHaveCSS('border-bottom-style', 'solid');

  const firstBox = await items.first().boundingBox();
  const secondBox = await items.nth(1).boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height);

  const screenshotPath = testInfo.outputPath('publication-bibliography-multiple.png');
  await list.screenshot({ path: screenshotPath });
  await testInfo.attach('publication-bibliography-multiple', {
    path: screenshotPath,
    contentType: 'image/png',
  });
});
