const { test, expect } = require('@playwright/test');

const pages = [
  { id: 'home-en', path: '/index.html', heading: 'About Me' },
  { id: 'home-ja', path: '/index.ja.html', heading: 'About me' },
  { id: 'timeline-en', path: '/archive.html', heading: 'Biography' },
  { id: 'timeline-ja', path: '/archive.ja.html', heading: '経歴' },
];

async function openWithTheme(page, path, theme) {
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem('theme', selectedTheme);
  }, theme);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(page.locator('#swup-content')).toBeVisible();
}

for (const pageDefinition of pages) {
  for (const theme of ['light', 'dark']) {
    test(`${pageDefinition.id} renders in ${theme} theme`, async ({ page }, testInfo) => {
      await openWithTheme(page, pageDefinition.path, theme);
      await expect(page.getByRole('heading', { name: pageDefinition.heading })).toBeVisible();

      const screenshotPath = testInfo.outputPath(`${pageDefinition.id}-${theme}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach(`${pageDefinition.id}-${theme}`, {
        path: screenshotPath,
        contentType: 'image/png',
      });
    });
  }
}

test('theme selection persists after reload', async ({ page }) => {
  await openWithTheme(page, '/index.html', 'light');

  await page.locator('[data-theme-toggle]').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('theme'))).toBe('dark');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('primary navigation and language switch remain available', async ({ page }) => {
  await openWithTheme(page, '/index.html', 'light');

  await Promise.all([
    page.waitForURL(/archive\.html$/),
    page.locator('a[href="archive.html"]').first().click(),
  ]);
  await expect(page.getByRole('heading', { name: 'Biography' })).toBeVisible();

  await Promise.all([
    page.waitForURL(/archive\.ja\.html$/),
    page.locator('.lang-link').click(),
  ]);
  await expect(page.getByRole('heading', { name: '経歴' })).toBeVisible();

  await Promise.all([
    page.waitForURL(/index\.ja\.html$/),
    page.locator('a[href="index.ja.html"]').first().click(),
  ]);
  await expect(page.getByRole('heading', { name: 'About me' })).toBeVisible();
});
