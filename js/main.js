/* ============================================================
   Marutyan's Portfolio — JavaScript entry point
   ============================================================ */

(function () {
  'use strict';

  async function loadModules() {
    const [theme, reveal, navigation, transitions, accessibility] = await Promise.all([
      import('./theme.js'),
      import('./reveal.js'),
      import('./navigation.js'),
      import('./transitions.js'),
      import('./accessibility.js'),
    ]);

    return { theme, reveal, navigation, transitions, accessibility };
  }

  async function start() {
    const { theme, reveal, navigation, transitions, accessibility } = await loadModules();

    const initializePage = () => {
      theme.applyTheme(theme.getPreferredTheme());
      theme.bindThemeToggles();
      reveal.initAnimations();
      navigation.updateLanguageLinks();
      navigation.updateTimelineState();
      accessibility.bindSkipLinks();
    };

    initializePage();

    transitions.initPageTransitions({
      onContentReplace: initializePage,
      onPageView: navigation.updateTimelineState,
    });
  }

  function reportInitializationError(error) {
    console.error('Failed to initialize the portfolio site.', error);
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        start().catch(reportInitializationError);
      },
      { once: true },
    );
  } else {
    start().catch(reportInitializationError);
  }
})();
