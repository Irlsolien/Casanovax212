/* CASANOVAX variante B — comportements globaux */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Burger */
  var btn = document.getElementById("nx-burger");
  var panel = document.getElementById("nx-mobile");
  if (btn && panel) {
    panel.hidden = true;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      btn.setAttribute("aria-label", open ? "Ouvrir le menu" : "Fermer le menu");
      panel.hidden = open;
      document.body.style.overflow = open ? "" : "hidden";
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) btn.click();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) btn.click();
    });
  }

  /* Compteurs animés [data-count-to] */
  var counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    var fmt = new Intl.NumberFormat("fr-FR");
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      if (isNaN(target) || reduced) { el.textContent = fmt.format(target || 0); return; }
      var start = null, dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt.format(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* Révélations */
  var els = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
