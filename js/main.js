/* ============================================================
   Marutyan's Portfolio — Main JavaScript
   Theme toggle, Swup init, scroll reveal, mobile hero
   ============================================================ */

(function () {
  "use strict";

  /* ----- Theme Toggle ----- */
  function getPreferredTheme() {
    var stored = localStorage.getItem("theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update theme icon visibility
    var iconLight = document.getElementById("theme-icon-light");
    var iconDark = document.getElementById("theme-icon-dark");
    if (iconLight) iconLight.style.display = theme === "light" ? "inline-block" : "none";
    if (iconDark) iconDark.style.display = theme === "dark" ? "inline-block" : "none";
  }

  // Apply theme immediately (before DOM ready to prevent flash)
  applyTheme(getPreferredTheme());

  /* ----- Scroll Reveal (IntersectionObserver) ----- */
  function initScrollReveal() {
    var elements = document.querySelectorAll(".scroll-reveal");
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ----- Update lang-link href after Swup navigation ----- */
  function updateLangLinks() {
    var path = window.location.pathname;
    var filename = path.split('/').pop() || 'index.html';
    var isJa = filename.includes('.ja.');
    var langLinks = document.querySelectorAll('.lang-link');
    langLinks.forEach(function (link) {
      if (isJa) {
        link.href = filename.replace('.ja.html', '.html');
        link.textContent = 'EN';
      } else {
        link.href = filename.replace('.html', '.ja.html');
        link.textContent = 'JA';
      }
    });
  }

  /* ----- Re-run animations after Swup page transition ----- */
  function initAnimations() {
    // Re-trigger fade-in-up animations
    var animatedEls = document.querySelectorAll(".animate-in");
    animatedEls.forEach(function (el) {
      el.style.animation = "none";
      // Force reflow
      void el.offsetHeight;
      el.style.animation = "";
    });

    initScrollReveal();
  }

  /* ----- DOM Ready ----- */
  document.addEventListener("DOMContentLoaded", function () {
    // Theme toggle buttons (desktop sidebar + mobile hero)
    var themeButtons = document.querySelectorAll("[data-theme-toggle]");
    themeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = localStorage.getItem("theme") || "light";
        var next = current === "light" ? "dark" : "light";
        applyTheme(next);
      });
    });

    // Initialize animations & scroll reveal
    initAnimations();

    // Swup initialization (skip lang-switch links via data-no-swup)
    if (typeof Swup !== "undefined") {
      var swup = new Swup({
        containers: ["#swup-content"],
        animationSelector: '[class*="transition-"]',
        cache: true,
        linkSelector: 'a[href]:not([target="_blank"]):not([data-no-swup]):not(.lang-link)',
      });

      swup.hooks.on("content:replace", function () {
        // Re-apply theme after new page content loads
        applyTheme(getPreferredTheme());
        initAnimations();
        updateLangLinks();

        // On mobile, scroll to article content so user notices page change
        if (window.innerWidth <= 600) {
          var article = document.getElementById("swup-content");
          if (article) {
            setTimeout(function () {
              article.scrollIntoView({ behavior: "smooth" });
            }, 50);
          }
        }

        // Re-bind theme toggle buttons on new page
        var newButtons = document.querySelectorAll("[data-theme-toggle]");
        newButtons.forEach(function (btn) {
          btn.addEventListener("click", function () {
            var current = localStorage.getItem("theme") || "light";
            var next = current === "light" ? "dark" : "light";
            applyTheme(next);
          });
        });
      });
    }
  });
})();
