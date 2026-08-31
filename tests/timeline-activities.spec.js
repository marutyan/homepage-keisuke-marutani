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

test('internships stay nested under activities with the same entry size', async ({ page }) => {
  await page.goto('/archive.html', { waitUntil: 'domcontentloaded' });

  const activityCard = page.locator('.activity-card').first();
  const activityTitle = activityCard.locator('h3');
  const internshipGroup = page.locator('.internship-group');
  const internshipTitle = page.locator('.internship-title').first();

  const activityBox = await activityCard.boundingBox();
  const internshipBox = await internshipGroup.boundingBox();
  expect(activityBox).not.toBeNull();
  expect(internshipBox).not.toBeNull();
  expect(internshipBox.x).toBeGreaterThan(activityBox.x);

  // 字下げで従属を示す一方、項目の文字はBiographyと同じ大きさへ揃えた
  const activityFontSize = await activityTitle.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  const internshipFontSize = await internshipTitle.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  const biographyFontSize = await page
    .locator('.timeline-content h3')
    .first()
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(internshipFontSize).toBe(activityFontSize);
  expect(activityFontSize).toBe(biographyFontSize);
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
