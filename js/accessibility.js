export function bindSkipLinks() {
  document.querySelectorAll('.skip-link[href^="#"]').forEach((link) => {
    link.onclick = () => {
      const target = document.querySelector(link.hash);
      if (!target) return;

      window.requestAnimationFrame(() => {
        target.focus();
      });
    };
  });
}
