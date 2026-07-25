const STORAGE_KEY = 'theme';

export function getPreferredTheme() {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme) return storedTheme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  window.localStorage.setItem(STORAGE_KEY, theme);

  const lightIcon = document.getElementById('theme-icon-light');
  const darkIcon = document.getElementById('theme-icon-dark');

  if (lightIcon) {
    lightIcon.style.display = theme === 'light' ? 'inline-block' : 'none';
  }
  if (darkIcon) {
    darkIcon.style.display = theme === 'dark' ? 'inline-block' : 'none';
  }

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  });
}

export function bindThemeToggles() {
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.onclick = () => {
      const currentTheme = window.localStorage.getItem(STORAGE_KEY) || 'light';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
    };
  });
}
