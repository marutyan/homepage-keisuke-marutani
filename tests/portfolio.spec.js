const { test, expect } = require('@playwright/test');

const pages = [
  { id: 'home-en', path: '/index.html', heading: 'About Me' },
  { id: 'home-ja', path: '/index.ja.html', heading: 'About me' },
  { id: 'timeline-en', path: '/archive.html', heading: 'Biography' },
  { id: 'timeline-ja', path: '/archive.ja.html', heading: 'Biography' },
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
      await expect(page.getByRole('heading', { name: pageDefinition.heading }).first()).toBeVisible();

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

  await page.locator('[data-theme-toggle]:visible').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('theme'))).toBe('dark');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('language switch and primary navigation remain available', async ({ page }) => {
  await openWithTheme(page, '/index.html', 'light');

  await Promise.all([
    page.waitForURL(/index\.ja\.html$/),
    page.locator('.lang-link:visible').first().click(),
  ]);
  await expect(page.getByRole('heading', { name: 'About me' }).first()).toBeVisible();

  await Promise.all([
    page.waitForURL(/archive\.ja\.html$/),
    page.locator('a[href="archive.ja.html"]:visible').first().click(),
  ]);
  await expect(page.getByRole('heading', { name: 'Biography' }).first()).toBeVisible();

  await Promise.all([
    page.waitForURL(/index\.ja\.html$/),
    page.locator('a[href="index.ja.html"]:visible').first().click(),
  ]);
  await expect(page.getByRole('heading', { name: 'About me' }).first()).toBeVisible();
});
