<script>
  /** @type {'en' | 'ja'} */
  let currentLang = $state('en');

  const translations = {
    en: {
      copy_right_author: "Author",
      copy_right_publish_date: "Publish Date",
      copy_right_license: "License",
      nav_bar_home: "Home",
      nav_bar_archive: "Archive",
      nav_bar_about: "About",
      nav_bar_github: "GitHub",
      nav_bar_search_placeholder: "Search",
      post_card_words: "Words",
      post_card_minutes: "Minutes",
      side_bar_categories: "Categories",
      side_bar_tags: "Tags",
      side_bar_view_more: "View More",
      archive_year_title_count: "Total {{}} article(s)",
      pages_categories_archive: "Article Archive",
      pages_tags_archive: "Tag Archive",
      pages_archive_archive: "Archive",
      pages_tags_title: "Tags",
      pages_categories_title: "Categories",
    },
    ja: {
      copy_right_author: "著者",
      copy_right_publish_date: "公開日",
      copy_right_license: "ライセンス",
      nav_bar_home: "ホーム",
      nav_bar_archive: "アーカイブ",
      nav_bar_about: "自己紹介",
      nav_bar_github: "GitHub",
      nav_bar_search_placeholder: "検索",
      post_card_words: "文字",
      post_card_minutes: "分",
      side_bar_categories: "カテゴリー",
      side_bar_tags: "タグ",
      side_bar_view_more: "もっと見る",
      archive_year_title_count: "合計 {{}} 件の記事",
      pages_categories_archive: "記事アーカイブ",
      pages_tags_archive: "タグアーカイブ",
      pages_archive_archive: "アーカイブ",
      pages_tags_title: "タグ",
      pages_categories_title: "カテゴリー",
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
