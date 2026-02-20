<script>
  /** @type {'en' | 'ja'} */
  let currentLang = $state('en');

  const translations = {
    en: {
      nav_bar_home: "Home",
      nav_bar_archive: "Timeline",
      nav_bar_github: "GitHub",
      side_bar_tags: "Interests",
    },
    ja: {
      nav_bar_home: "ホーム",
      nav_bar_archive: "経歴",
      nav_bar_github: "GitHub",
      side_bar_tags: "興味分野",
    },
  };

  function applyTranslations() {
    const lang = /** @type {'en' | 'ja'} */ (currentLang);
    const trans = translations[lang];
    const elements = document.querySelectorAll('[data-i18n-key]');
    elements.forEach((el) => {
      const key = el.getAttribute('data-i18n-key');
      if (key && trans[key]) {
        el.textContent = trans[key];
      }
    });
    // Update search placeholder
    const searchInputs = document.querySelectorAll('input[data-i18n-placeholder]');
    searchInputs.forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && trans[key]) {
        /** @type {HTMLInputElement} */ (el).placeholder = trans[key];
      }
    });
  }

  function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ja' : 'en';
    localStorage.setItem('site-lang', currentLang);
    applyTranslations();
  }

  $effect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('site-lang');
      if (saved === 'ja' || saved === 'en') {
        currentLang = saved;
      }
      applyTranslations();
    }
  });
</script>

<button
  onclick={toggleLanguage}
  class="lang-toggle flex w-11 justify-center rounded-lg py-2
         text-[var(--text-color)] transition-all
         hover:bg-[var(--primary-color-hover)]
         hover:text-[var(--primary-color)]"
  aria-label="Toggle language"
  title={currentLang === 'en' ? 'Switch to Japanese' : 'Switch to English'}
>
  <span class="text-sm font-bold">
    {currentLang === 'en' ? 'JA' : 'EN'}
  </span>
</button>

<style>
  .lang-toggle {
    cursor: pointer;
    border: none;
    background: transparent;
  }
</style>
