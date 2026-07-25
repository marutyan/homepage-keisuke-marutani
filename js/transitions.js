function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToArticleOnMobile() {
  if (window.innerWidth > 900) return;

  const article = document.getElementById('swup-content');
  if (!article) return;

  window.setTimeout(() => {
    const top = article.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, 150);
}

export function initPageTransitions({ onContentReplace, onPageView }) {
  if (typeof window.Swup === 'undefined') return null;

  const swup = new window.Swup({
    containers: ['#home'],
    animationSelector: '[class*="transition-"]',
    cache: true,
    linkSelector: 'a[href]:not([target="_blank"]):not([data-no-swup]):not(.lang-link)',
  });

  swup.hooks.on('content:replace', () => {
    onContentReplace();
  });

  swup.hooks.on('page:view', () => {
    onPageView();
    scrollToArticleOnMobile();
  });

  return swup;
}
