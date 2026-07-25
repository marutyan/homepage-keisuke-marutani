function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function revealImmediately(elements) {
  elements.forEach((element) => element.classList.add('is-visible'));
}

export function initScrollReveal() {
  const elements = Array.from(document.querySelectorAll('.scroll-reveal'));
  if (!elements.length) return;

  if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
    revealImmediately(elements);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  elements.forEach((element) => observer.observe(element));
}

export function restartEntryAnimations() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll('.animate-in').forEach((element) => {
    element.style.animation = 'none';
    void element.offsetHeight;
    element.style.animation = '';
  });
}

export function initAnimations() {
  restartEntryAnimations();
  initScrollReveal();
}
