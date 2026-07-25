const { test, expect } = require('@playwright/test');

const JAPANESE_PARAGRAPHS = [
  '近畿大学情報学部情報学科の学部4年生で、コンピュータビジョン研究室に所属。',
  'コンピュータビジョンと深層学習に関心があり、物体検出と物体追跡について研究。',
  '現在は、混雑環境における遮蔽人物の検出精度向上に取り組んでいます。',
];

const JAPANESE_COMMENT =
  '研究分野に関する議論や、コラボレーションの機会待ってます！！！ぜひお気軽にご連絡ください！！！';

const ENGLISH_COMMENT =
  "I'm always open to discussions about my research field and collaboration opportunities. Please feel free to reach out!";

async function readParagraphs(page) {
  return page.locator('.about-copy p').allTextContents();
}

test('Japanese About copy matches the approved wording exactly', async ({ page }) => {
  await page.goto('/index.ja.html', { waitUntil: 'domcontentloaded' });

  await expect.poll(() => readParagraphs(page)).toEqual(JAPANESE_PARAGRAPHS);
  await expect(page.locator('.about-comment')).toHaveText(JAPANESE_COMMENT);
});

test('English personal comment remains unchanged', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.about-comment')).toHaveText(ENGLISH_COMMENT);
});

test('About copy and personal comment remain visually distinct', async ({ page }) => {
  await page.goto('/index.ja.html', { waitUntil: 'domcontentloaded' });

  const copy = page.locator('.about-copy');
  const comment = page.locator('.about-comment');

  await expect(copy).toBeVisible();
  await expect(comment).toBeVisible();
  await expect(comment).toHaveCSS('border-left-style', 'solid');
  await expect(comment).toHaveCSS('font-weight', '700');

  const copyBox = await copy.boundingBox();
  const commentBox = await comment.boundingBox();
  expect(copyBox).not.toBeNull();
  expect(commentBox).not.toBeNull();
  expect(commentBox.y).toBeGreaterThan(copyBox.y + copyBox.height);
});
