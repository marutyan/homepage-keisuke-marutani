const { test, expect } = require('@playwright/test');

const pages = ['/index.html', '/index.ja.html', '/archive.html', '/archive.ja.html'];
const representativeWidths = [768, 1024, 1280, 1440, 1600, 1920];
const desktopWidths = representativeWidths.filter((width) => width > 900);

function numericPixelValue(value) {
  return Number.parseFloat(value.replace('px', ''));
}

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

test('desktop main content uses a smaller independent type scale', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const fontSizes = await page.evaluate(() => {
    const readSize = (selector) => getComputedStyle(document.querySelector(selector)).fontSize;
    return {
      main: readSize('#swup-content'),
      sidebarName: readSize('.bio-myname'),
      heading: readSize('.subtitle'),
      profileValue: readSize('.about-profile-value'),
      interest: readSize('.interests li'),
      publicationTitle: readSize('.publication-title'),
      publicationAuthors: readSize('.publication-authors'),
      skillChip: readSize('.skill-chip'),
    };
  });

  expect(fontSizes.main).toBe('18px');
  expect(fontSizes.sidebarName).toBe('36px');
  expect(numericPixelValue(fontSizes.heading)).toBeCloseTo(32.4, 1);
  expect(fontSizes.profileValue).toBe('18px');
  expect(fontSizes.interest).toBe('18px');
  expect(numericPixelValue(fontSizes.publicationTitle)).toBeCloseTo(18.9, 1);
  expect(numericPixelValue(fontSizes.publicationAuthors)).toBeCloseTo(15.3, 1);
  expect(numericPixelValue(fontSizes.skillChip)).toBeCloseTo(15.3, 1);
});

test('mobile layout restores the original root and main content sizes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium');

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const sizes = await page.evaluate(() => ({
    root: getComputedStyle(document.documentElement).fontSize,
    main: getComputedStyle(document.querySelector('#swup-content')).fontSize,
    heading: getComputedStyle(document.querySelector('.subtitle')).fontSize,
  }));

  expect(sizes.root).toBe('16px');
  expect(sizes.main).toBe('16px');
  expect(sizes.heading).toBe('22px');
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
