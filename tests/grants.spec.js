const { test, expect } = require('@playwright/test');

const GRANT_FOUNDATION_URL = 'https://g-7foundation.or.jp/about.html';

// 各言語ページで表示されるべき助成の記載内容。データと表示のずれを検出する。
const EXPECTED_GRANT_BY_PATH = {
  '/index.html': {
    name: 'G-7 Scholarship Foundation Scholarship',
    role: 'Scholarship Student',
    period: 'Apr 2026 – Mar 2027',
  },
  '/index.ja.html': {
    name: '公益財団法人 G-7奨学財団 奨学金助成',
    role: '奨学生',
    period: '2026年4月 – 2027年3月',
  },
};

for (const [path, expected] of Object.entries(EXPECTED_GRANT_BY_PATH)) {
  test(`grants section renders the localized funding entry on ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    const items = page.locator('.grant-item');
    const firstItem = items.first();

    await expect(items).toHaveCount(1);
    await expect(firstItem.locator('.grant-title')).toHaveText(expected.name);
    await expect(firstItem.locator('.grant-role')).toHaveText(expected.role);
    await expect(firstItem.locator('.grant-period')).toHaveText(expected.period);
    await expect(firstItem.locator('.grant-period time')).toHaveAttribute('datetime', '2026');

    const titleLink = firstItem.locator('.grant-title a.entry-link');
    await expect(titleLink).toHaveAttribute('href', GRANT_FOUNDATION_URL);
    await expect(titleLink).toHaveAttribute('target', '_blank');
    await expect(titleLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
}

test('grants section is placed between publications and skills', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('main .subtitle')).toHaveText([
    'About Me',
    'Research Interests',
    'Publications',
    'Grants',
    'Skills',
  ]);
});
