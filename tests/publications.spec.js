const { test, expect } = require('@playwright/test');
const configureEleventy = require('../.eleventy.js');

const TITLE = '混雑環境下の人物検出に向けた遮蔽を考慮したクエリ選択';
const PAPER_URL = 'https://drive.google.com/file/d/1Ptm3sMclI-0E-y8pa0xfWpykWwOsWNrB/view?usp=sharing';

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

test('publication entry shows a thumbnail and paper and poster buttons', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const firstItem = page.locator('.publication-item').first();
  const thumbnail = firstItem.locator('.publication-thumbnail');

  // 寸法を属性で持たせて、読み込み時に本文がずれないようにしている
  await expect(thumbnail).toHaveAttribute('src', 'images/miru2026-marutani.jpg');
  await expect(thumbnail).toHaveAttribute('width', '640');
  await expect(thumbnail).toHaveAttribute('height', '426');
  await expect(thumbnail).toHaveAttribute('loading', 'lazy');
  await expect(thumbnail).toHaveAttribute('decoding', 'async');
  await expect(thumbnail).toHaveAttribute('alt', TITLE);
  await expect(thumbnail).toBeVisible();
  expect(await thumbnail.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);

  const links = firstItem.locator('.publication-link');
  await expect(links).toHaveText(['Paper', 'Poster']);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(await link.getAttribute('href')).toMatch(/^https:\/\/drive\.google\.com\/file\/d\//);
  }
});

test('thumbnail and title link to the paper URL', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const firstItem = page.locator('.publication-item').first();

  const thumbnailLink = firstItem.locator('a.publication-thumbnail-link');
  await expect(thumbnailLink).toHaveAttribute('href', PAPER_URL);
  await expect(thumbnailLink).toHaveAttribute('target', '_blank');
  await expect(thumbnailLink).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(thumbnailLink.locator('.publication-thumbnail')).toHaveCount(1);

  const titleLink = firstItem.locator('.publication-title a.entry-link');
  await expect(titleLink).toHaveAttribute('href', PAPER_URL);
  await expect(titleLink).toHaveAttribute('target', '_blank');
  await expect(titleLink).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(titleLink).toHaveText(TITLE);
});
