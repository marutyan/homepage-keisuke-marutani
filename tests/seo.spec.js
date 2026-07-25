const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://marutyan.github.io/homepage-keisuke-marutani/';

const pages = [
  {
    path: '/index.html',
    canonical: `${BASE_URL}index.html`,
    alternate: `${BASE_URL}index.ja.html`,
    language: 'en',
    alternateLanguage: 'ja',
  },
  {
    path: '/index.ja.html',
    canonical: `${BASE_URL}index.ja.html`,
    alternate: `${BASE_URL}index.html`,
    language: 'ja',
    alternateLanguage: 'en',
  },
  {
    path: '/archive.html',
    canonical: `${BASE_URL}archive.html`,
    alternate: `${BASE_URL}archive.ja.html`,
    language: 'en',
    alternateLanguage: 'ja',
  },
  {
    path: '/archive.ja.html',
    canonical: `${BASE_URL}archive.ja.html`,
    alternate: `${BASE_URL}archive.html`,
    language: 'ja',
    alternateLanguage: 'en',
  },
];

for (const pageDefinition of pages) {
  test(`${pageDefinition.path} exposes localized SEO metadata`, async ({ page }) => {
    await page.goto(pageDefinition.path, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('html')).toHaveAttribute('lang', pageDefinition.language);
    expect((await page.title()).trim().length).toBeGreaterThan(0);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S{20,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', pageDefinition.canonical);
    await expect(page.locator(`link[rel="alternate"][hreflang="${pageDefinition.language}"]`)).toHaveAttribute(
      'href',
      pageDefinition.canonical,
    );
    await expect(
      page.locator(`link[rel="alternate"][hreflang="${pageDefinition.alternateLanguage}"]`),
    ).toHaveAttribute('href', pageDefinition.alternate);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      pageDefinition.language === 'ja' ? pageDefinition.alternate : pageDefinition.canonical,
    );

    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', pageDefinition.canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `${BASE_URL}images/mainicon.webp`,
    );
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      'content',
      'Keisuke Marutani Portfolio',
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      `${BASE_URL}images/mainicon.webp`,
    );

    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    const profilePage = JSON.parse(structuredData);
    expect(profilePage['@type']).toBe('ProfilePage');
    expect(profilePage.url).toBe(pageDefinition.canonical);
    expect(profilePage.mainEntity['@type']).toBe('Person');
    expect(profilePage.mainEntity.name).toBe('Keisuke Marutani');
    expect(profilePage.mainEntity.sameAs).toContain('https://github.com/marutyan');
  });
}

test('sitemap and robots expose every public route', async ({ request }) => {
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();

  for (const route of ['index.html', 'index.ja.html', 'archive.html', 'archive.ja.html']) {
    expect(sitemap).toContain(`${BASE_URL}${route}`);
  }
  expect(sitemap).toContain('hreflang="en"');
  expect(sitemap).toContain('hreflang="ja"');
  expect(sitemap).toContain('hreflang="x-default"');

  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok()).toBeTruthy();
  const robots = await robotsResponse.text();
  expect(robots).toContain('User-agent: *');
  expect(robots).toContain('Allow: /');
  expect(robots).toContain(`Sitemap: ${BASE_URL}sitemap.xml`);
});

test('external runtime dependencies are pinned and images declare loading behavior', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('link[href="https://unpkg.com/ress@5.0.2/dist/ress.min.css"]')).toHaveCount(1);
  await expect(page.locator('script[src="https://unpkg.com/swup@4.8.2/dist/Swup.umd.js"]')).toHaveCount(1);
  await expect(
    page.locator('script[src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js"]'),
  ).toHaveCount(1);

  const portrait = page.locator('img.logo');
  await expect(portrait).toHaveAttribute('width', '150');
  await expect(portrait).toHaveAttribute('height', '150');
  await expect(portrait).toHaveAttribute('loading', 'eager');
  await expect(portrait).toHaveAttribute('decoding', 'async');
  await expect(portrait).toHaveAttribute('fetchpriority', 'high');

  const laboratoryIcon = page.locator('img.nav-lab-icon');
  await expect(laboratoryIcon).toHaveAttribute('width', '22');
  await expect(laboratoryIcon).toHaveAttribute('height', '22');
  await expect(laboratoryIcon).toHaveAttribute('loading', 'lazy');
  await expect(laboratoryIcon).toHaveAttribute('decoding', 'async');
});

test('all internal navigation targets return a successful response', async ({ page, request }) => {
  for (const pageDefinition of pages) {
    await page.goto(pageDefinition.path, { waitUntil: 'domcontentloaded' });
    const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href')).filter(Boolean),
    );

    for (const href of new Set(hrefs)) {
      if (href.startsWith('#') || href.startsWith('mailto:')) continue;
      const target = new URL(href, page.url());
      if (target.origin !== new URL(page.url()).origin) continue;

      const response = await request.get(`${target.pathname}${target.search}`);
      expect(response.ok(), `${pageDefinition.path} -> ${href}`).toBeTruthy();
    }
  }
});
