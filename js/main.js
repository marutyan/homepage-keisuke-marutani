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

    // Duplicate for mobile
    var mIconLight = document.getElementById("m-theme-icon-light");
    var mIconDark = document.getElementById("m-theme-icon-dark");
    if (mIconLight) mIconLight.style.display = theme === "light" ? "inline-block" : "none";
    if (mIconDark) mIconDark.style.display = theme === "dark" ? "inline-block" : "none";
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

    // Swup initialization
    if (typeof Swup !== "undefined") {
      var swup = new Swup({
        containers: ["#swup-content"],
        animationSelector: '[class*="transition-"]',
        cache: true,
      });

      swup.hooks.on("content:replace", function () {
        // Re-apply theme after new page content loads
        applyTheme(getPreferredTheme());
        initAnimations();

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
