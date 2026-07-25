const { test, expect } = require('@playwright/test');

const JAPANESE_FACTS = [
  {
    label: '所属',
    value: '近畿大学 情報学部 情報学科 / コンピュータビジョン研究室',
  },
  {
    label: '学年',
    value: '学部4年生',
  },
  {
    label: '研究内容',
    value: '混雑環境における遮蔽人物の検出精度向上',
  },
];

const ENGLISH_FACTS = [
  {
    label: 'Affiliation',
    value: 'Department of Informatics, Faculty of Informatics, Kindai University / Computer Vision Laboratory',
  },
  {
    label: 'Year',
    value: 'Fourth-year undergraduate student',
  },
  {
    label: 'Research',
    value: 'Improving occluded person detection in crowded environments',
  },
];

const JAPANESE_COMMENT =
  '研究分野に関する議論や、コラボレーションの機会待ってます！！！ぜひお気軽にご連絡ください！！！';

const ENGLISH_COMMENT =
  "I'm always open to discussions about my research field and collaboration opportunities. Please feel free to reach out!";

const ADDED_INTERESTS = {
  en: ['Segmentation', 'Autonomous Driving', 'World Models', 'Physical AI'],
  ja: ['セグメンテーション', '自動運転', 'ワールドモデル', 'フィジカルAI'],
};

async function readFacts(page) {
  return page.locator('.about-profile-row').evaluateAll((rows) =>
    rows.map((row) => ({
      label: row.querySelector('.about-profile-label').textContent.trim(),
      value: row.querySelector('.about-profile-value').textContent.trim(),
    })),
  );
}

test('Japanese About profile matches the approved facts exactly', async ({ page }) => {
  await page.goto('/index.ja.html', { waitUntil: 'domcontentloaded' });

  await expect.poll(() => readFacts(page)).toEqual(JAPANESE_FACTS);
  await expect(page.locator('.about-comment')).toHaveText(JAPANESE_COMMENT);
});

test('English About profile mirrors the structured facts', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  await expect.poll(() => readFacts(page)).toEqual(ENGLISH_FACTS);
  await expect(page.locator('.about-comment')).toHaveText(ENGLISH_COMMENT);
});

test('personal comment reads as normal copy with sufficient separation', async ({ page }) => {
  await page.goto('/index.ja.html', { waitUntil: 'domcontentloaded' });

  const profile = page.locator('.about-profile');
  const value = page.locator('.about-profile-value').first();
  const comment = page.locator('.about-comment');

  await expect(profile).toBeVisible();
  await expect(comment).toBeVisible();
  await expect(comment).toHaveCSS('border-left-style', 'none');
  await expect(comment).toHaveCSS('font-weight', '400');

  const valueColor = await value.evaluate((element) => getComputedStyle(element).color);
  const commentColor = await comment.evaluate((element) => getComputedStyle(element).color);
  expect(commentColor).toBe(valueColor);

  const profileBox = await profile.boundingBox();
  const commentBox = await comment.boundingBox();
  expect(profileBox).not.toBeNull();
  expect(commentBox).not.toBeNull();
  expect(commentBox.y - (profileBox.y + profileBox.height)).toBeGreaterThanOrEqual(30);
});

for (const [locale, interests] of Object.entries(ADDED_INTERESTS)) {
  test(`${locale} Research Interests include profile README topics`, async ({ page }) => {
    await page.goto(locale === 'ja' ? '/index.ja.html' : '/index.html', {
      waitUntil: 'domcontentloaded',
    });

    const renderedInterests = await page.locator('.interests li').allTextContents();
    for (const interest of interests) {
      expect(renderedInterests.map((item) => item.trim())).toContain(interest);
    }
  });
}
