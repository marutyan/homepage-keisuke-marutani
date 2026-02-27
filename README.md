# Marutyan's Portfolio

Personal portfolio website for Keisuke Marutani.

## Tech Stack

- **Plain HTML + CSS + JS** — no build tools, no npm
- **Neumorphism design** — inset/outset box-shadow effects
- **Dark mode** — CSS variables with `[data-theme]` toggle
- **Responsive** — sticky sidebar (desktop) / full-screen hero (mobile)
- **Page transitions** — [Swup v4](https://swup.js.org/) (CDN)
- **Icons** — [Iconify](https://iconify.design/) web component (CDN)
- **PWA** — Web App Manifest (favicon_images/site.webmanifest)
- **EN / JA** — separate HTML files per language

## Pages

| Page | EN | JA |
|------|----|----|
| Home | `index.html` | `index.ja.html` |
| Timeline | `archive.html` | `archive.ja.html` |

## Local Development

```bash
python3 -m http.server 4321
# Open http://localhost:4321
```

## Deployment

Push to GitHub and enable GitHub Pages (deploy from `master` branch root).
The `.nojekyll` file ensures GitHub Pages serves static HTML directly.