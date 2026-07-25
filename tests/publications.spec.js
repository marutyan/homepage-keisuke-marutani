const { test, expect } = require('@playwright/test');
const configureEleventy = require('../.eleventy.js');

const TITLE = '混雑環境下の人物検出に向けた遮蔽を考慮したクエリ選択';

function getPublicationFilters() {
  const filters = {};

  configureEleventy({
    addPassthroughCopy() {},
    addFilter(name, callback) {
      filters[name] = callback;
    },
  });

  return filters;
}

test('publication filters sort and group entries by year without mutating source', () => {
  const { sortByYearDesc, groupByYearDesc } = getPublicationFilters();
  const source = [
    { year: 2024, title: 'A' },
    { year: 2026, title: 'B' },
    { year: 2025, title: 'C' },
    { year: 2026, title: 'D' },
  ];

  expect(sortByYearDesc(source).map(({ year }) => year)).toEqual([2026, 2026, 2025, 2024]);
  expect(groupByYearDesc(source)).toEqual([
    { year: 2026, publications: [source[1], source[3]] },
    { year: 2025, publications: [source[2]] },
    { year: 2024, publications: [source[0]] },
  ]);
  expect(source.map(({ year }) => year)).toEqual([2024, 2026, 2025, 2026]);
});

test('publication list renders year framing, author emphasis, and venue prefix', async ({ page }, testInfo) => {
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

  const groups = page.locator('.publication-year-group');
  const firstGroup = groups.first();
  const items = firstGroup.locator('.publication-item');
  const firstItem = items.first();

  await expect(groups).toHaveCount(1);
  await expect(firstGroup.locator('.publication-year')).toHaveText('2026');
  await expect(firstGroup.locator('.publication-year-line')).toBeVisible();
  await expect(items).toHaveCount(1);
  await expect(firstItem.locator('.publication-title')).toHaveText(TITLE);
  await expect(firstItem.locator('.publication-authors')).toContainText('Keisuke Marutani');
  await expect(firstItem.locator('.publication-venue')).toContainText('- The 29th Meeting');
  await expect(firstItem.locator('.publication-venue')).toContainText('MIRU2026');
  await expect(firstItem.locator('.publication-marker')).toHaveCount(0);

  const selfAuthor = firstItem.locator('.publication-author--self');
  const coauthor = firstItem.locator('.publication-author:not(.publication-author--self)').first();
  await expect(selfAuthor).toHaveText('Keisuke Marutani');
  await expect(selfAuthor).toHaveCSS('font-weight', '700');
  await expect(selfAuthor).toHaveCSS('text-decoration-line', 'underline');

  const selfColor = await selfAuthor.evaluate((element) => getComputedStyle(element).color);
  const coauthorColor = await coauthor.evaluate((element) => getComputedStyle(element).color);
  expect(selfColor).not.toBe(coauthorColor);

  await page.evaluate(() => {
    const publicationGroups = document.querySelector('.publication-groups');
    const firstYearGroup = publicationGroups.querySelector('.publication-year-group');
    const firstPublication = firstYearGroup.querySelector('.publication-item');

    const secondPublication = firstPublication.cloneNode(true);
    secondPublication.querySelector('.publication-title').textContent = '同一年の複数件表示確認用Publication';
    firstYearGroup.querySelector('.publication-list').append(secondPublication);

    const secondYearGroup = firstYearGroup.cloneNode(true);
    secondYearGroup.dataset.publicationYear = '2025';
    secondYearGroup.setAttribute('aria-labelledby', 'publication-year-2025');
    const yearHeading = secondYearGroup.querySelector('.publication-year');
    yearHeading.id = 'publication-year-2025';
    const time = yearHeading.querySelector('time');
    time.textContent = '2025';
    time.setAttribute('datetime', '2025');
    secondYearGroup.querySelector('.publication-list').innerHTML = '';
    const previousYearPublication = firstPublication.cloneNode(true);
    previousYearPublication.querySelector('.publication-title').textContent = '前年のPublication';
    secondYearGroup.querySelector('.publication-list').append(previousYearPublication);
    publicationGroups.append(secondYearGroup);
  });

  await expect(groups).toHaveCount(2);
  await expect(groups.first().locator('.publication-item')).toHaveCount(2);
  await expect(groups.nth(1).locator('.publication-year')).toHaveText('2025');

  const firstGroupBox = await groups.first().boundingBox();
  const secondGroupBox = await groups.nth(1).boundingBox();
  expect(firstGroupBox).not.toBeNull();
  expect(secondGroupBox).not.toBeNull();
  expect(secondGroupBox.y).toBeGreaterThan(firstGroupBox.y + firstGroupBox.height);

  const screenshotPath = testInfo.outputPath('publication-year-groups.png');
  await page.locator('.publication-groups').screenshot({ path: screenshotPath });
  await testInfo.attach('publication-year-groups', {
    path: screenshotPath,
    contentType: 'image/png',
  });
});
