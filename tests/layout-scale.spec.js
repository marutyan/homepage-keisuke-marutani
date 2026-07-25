const { test, expect } = require('@playwright/test');

const pages = ['/index.html', '/index.ja.html', '/archive.html', '/archive.ja.html'];
const representativeWidths = [768, 1024, 1280, 1440, 1600, 1920];
const desktopWidths = representativeWidths.filter((width) => width > 900);

test('desktop layout uses explicit root sizing without CSS zoom', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const rootStyles = await page.locator('html').evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      fontSize: styles.fontSize,
      zoom: styles.zoom,
    };
  });

  expect(rootStyles.fontSize).toBe('24px');
  expect(rootStyles.zoom).toBe('1');

  const cssWithZoom = await page.evaluate(async () => {
    const localStyleSheets = Array.from(document.styleSheets).filter((sheet) =>
      sheet.href && new URL(sheet.href).origin === window.location.origin,
    );
    const rules = localStyleSheets.flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules, (rule) => rule.cssText);
      } catch {
        return [];
      }
    });
    return rules.filter((rule) => /(^|[;{\s])zoom\s*:/i.test(rule));
  });

  expect(cssWithZoom).toEqual([]);
});

test('mobile layout restores the original root size', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium');

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).fontSize)).toBe(
    '16px',
  );
});

test('desktop content expands with the available main column', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');

  for (const width of desktopWidths) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    await page.goto('/index.ja.html', { waitUntil: 'domcontentloaded' });

    const dimensions = await page.evaluate(() => {
      const wrapper = document.querySelector('.about-section');
      const profile = document.querySelector('.about-profile');
      const main = document.querySelector('#swup-content');
      const wrapperBox = wrapper.getBoundingClientRect();
      const profileBox = profile.getBoundingClientRect();
      const mainBox = main.getBoundingClientRect();

      return {
        wrapperWidth: wrapperBox.width,
        profileWidth: profileBox.width,
        mainWidth: mainBox.width,
      };
    });

    expect(dimensions.profileWidth, `profile width at ${width}px`).toBeGreaterThanOrEqual(
      dimensions.wrapperWidth * 0.95,
    );
    expect(dimensions.wrapperWidth, `wrapper width at ${width}px`).toBeGreaterThanOrEqual(
      dimensions.mainWidth * 0.85,
    );

    await context.close();
  }
});

test('representative widths do not create horizontal overflow', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');

  for (const width of representativeWidths) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();

    for (const path of pages) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(dimensions.scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    }

    const screenshotPath = testInfo.outputPath(`layout-${width}.png`);
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({
      content: `
        *, *::before, *::after { animation: none !important; transition: none !important; }
        .animate-in, .scroll-reveal { opacity: 1 !important; transform: none !important; }
        iconify-icon { visibility: hidden !important; }
      `,
    });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach(`layout-${width}`, { path: screenshotPath, contentType: 'image/png' });

    await context.close();
  }
});
