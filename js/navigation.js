export function updateLanguageLinks() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  const isJapanese = filename.includes('.ja.');

  document.querySelectorAll('.lang-link').forEach((link) => {
    if (isJapanese) {
      link.href = filename.replace('.ja.html', '.html');
      link.textContent = 'EN';
    } else {
      link.href = filename.replace('.html', '.ja.html');
      link.textContent = 'JA';
    }
  });
}

export function updateTimelineState() {
  const isTimeline = window.location.href.includes('archive');
  document.body.classList.toggle('is-timeline', isTimeline);
}
