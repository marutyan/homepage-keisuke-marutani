const { test, expect } = require('@playwright/test');

const EXPECTED = {
  en: {
    path: '/archive.html',
    activities: ['KINDAI Info-Tech HUB', 'Specified Nonprofit Corporation NxTEND'],
    internships: ['CA Tech Dojo - Android', 'Android Internship'],
  },
  ja: {
    path: '/archive.ja.html',
    activities: ['KINDAI Info-Tech HUB', '特定非営利活動法人NxTEND'],
    internships: ['CA Tech Dojo - Android', 'Android Internship'],
  },
};

for (const [locale, expected] of Object.entries(EXPECTED)) {
  test(`${locale} timeline combines activities and internships`, async ({ page }) => {
    await page.goto(expected.path, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Biography', exact: true })).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Activities', exact: true })).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Internships', exact: true })).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Others', exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Internship', exact: true })).toHaveCount(0);

    const activityTitles = await page.locator('.activity-card-content h3').allTextContents();
    expect(activityTitles.map((item) => item.trim())).toEqual(expected.activities);

    const internshipTitles = await page.locator('.internship-title').allTextContents();
    expect(internshipTitles.map((item) => item.trim())).toEqual(expected.internships);
    await expect(page.locator('.activities-section .internship-group')).toHaveCount(1);
    await expect(page.locator('.activities-section .timeline')).toHaveCount(0);
  });
}

test('internships line up with activities at the same position and entry size', async ({ page }) => {
  await page.goto('/archive.html', { waitUntil: 'domcontentloaded' });

  const activityCard = page.locator('.activity-card').first();
  const activityTitle = activityCard.locator('h3');
  const internshipItem = page.locator('.internship-item').first();
  const internshipTitle = page.locator('.internship-title').first();

  // 字下げをやめ、Activities と同じ左端、同じ幅で並べる
  const activityBox = await activityCard.boundingBox();
  const internshipBox = await internshipItem.boundingBox();
  expect(activityBox).not.toBeNull();
  expect(internshipBox).not.toBeNull();
  expect(internshipBox.x).toBeCloseTo(activityBox.x, 1);
  expect(internshipBox.width).toBeCloseTo(activityBox.width, 1);

  // 項目の文字は Biography と同じ大きさへ揃える
  const activityFontSize = await activityTitle.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  const internshipFontSize = await internshipTitle.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  const biographyFontSize = await page
    .locator('.timeline-content h3')
    .first()
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(internshipFontSize).toBe(activityFontSize);
  expect(activityFontSize).toBe(biographyFontSize);
});

test('activities and internships fill the main column on mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium');

  await page.goto('/archive.html', { waitUntil: 'domcontentloaded' });

  // Research Interests と同じ幅の扱いになっているかを比べる
  const widths = await page.evaluate(() => ({
    biography: document.querySelector('.short-cv.timeline').getBoundingClientRect().width,
    activities: document.querySelector('.activity-card-list').getBoundingClientRect().width,
    internships: document.querySelector('.internship-group').getBoundingClientRect().width,
  }));

  expect(widths.activities).toBeCloseTo(widths.biography, 1);
  expect(widths.internships).toBeCloseTo(widths.biography, 1);
});

test('activity cards adapt from two columns to one column', async ({ page }, testInfo) => {
  await page.goto('/archive.html', { waitUntil: 'domcontentloaded' });

  const columnCount = await page.locator('.activity-card').first().evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length,
  );

  if (testInfo.project.name === 'mobile-chromium') {
    expect(columnCount).toBe(1);
  } else {
    expect(columnCount).toBe(2);
  }
});
