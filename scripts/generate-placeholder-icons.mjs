/**
 * Generate placeholder PWA icons as simple colored squares with "K" letter.
 * These are temporary — replace with real icons later.
 *
 * Usage: node scripts/generate-placeholder-icons.mjs
 *
 * Creates:
 *   public/android-chrome-192x192.png
 *   public/android-chrome-512x512.png
 *   public/apple-touch-icon.png
 *   public/favicon-32x32.png
 *   public/favicon-16x16.png
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

// Minimal SVG template with "K" on a blue background
function createSvgIcon(size) {
  const fontSize = Math.round(size * 0.55);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="#4a90d9"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="bold"
        font-size="${fontSize}" fill="white">K</text>
</svg>`;
}

// Write SVG files as placeholder (browsers handle SVG well, and these are temporary)
const sizes = [
  { name: "android-chrome-512x512.png", size: 512 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon-16x16.png", size: 16 },
];

// Since we can't easily generate PNG without dependencies,
// we'll create SVG files with .png extension as temporary placeholders.
// For production, replace these with real PNG files.
for (const { name, size } of sizes) {
  const svg = createSvgIcon(size);
  const path = join(publicDir, name);
  writeFileSync(path, svg);
  console.log(`Created placeholder: ${path} (${size}x${size})`);
}

console.log(
  "\n⚠️  These are SVG placeholders with .png extension. Replace with real PNG icons for production."
);
