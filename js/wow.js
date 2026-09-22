/* CASANOVAX — couche d'animations premium (vanilla, transforms/opacity only) */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduced) return;

  /* ---------- 1. Barre de progression de scroll ---------- */
  var bar = document.createElement("div");
  bar.className = "nx-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var ticking = false;
  function paintProgress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(paintProgress); }
  }, { passive: true });
  paintProgress();

  /* ---------- 2. Révélation masquée ligne par ligne des titres ---------- */
  var heads = document.querySelectorAll(".nx-h1, .nx-h2");
  heads.forEach(function (el) {
    if (el.querySelector("img")) return;
    el.removeAttribute("data-reveal"); /* le masque remplace le fondu générique */
    var tokens = [];
    (function walk(node, emph) {
      Array.prototype.forEach.call(node.childNodes, function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/[^\S ]+/).filter(Boolean).forEach(function (w) {
            tokens.push({ t: w, e: emph });
          });
        } else if (n.nodeType === 1) {
          walk(n, emph || /^(EM|STRONG|B|I)$/.test(n.tagName));
        }
      });
    })(el, false);
    if (!tokens.length) return;
    el.setAttribute("aria-label", tokens.map(function (t) { return t.t; }).join(" "));

    function build() {
      el.innerHTML = "";
      var frag = document.createDocumentFragment();
      tokens.forEach(function (tok, i) {
        var w = document.createElement("span");
        w.className = "mr-word";
        w.setAttribute("aria-hidden", "true");
        if (tok.e) { var em = document.createElement("em"); em.textContent = tok.t; w.appendChild(em); }
        else w.textContent = tok.t;
        frag.appendChild(w);
        if (i < tokens.length - 1) frag.appendChild(document.createTextNode(" "));
      });
      el.appendChild(frag);
      return Array.prototype.slice.call(el.querySelectorAll(".mr-word"));
    }
    function group() {
      var words = build();
      var lines = [], cur = [], last = -1;
      words.forEach(function (w) {
        var top = w.offsetTop;
        if (last !== -1 && top > last + 1) { lines.push(cur); cur = []; }
        cur.push(w); last = top;
      });
      if (cur.length) lines.push(cur);
      el.innerHTML = "";
      lines.forEach(function (ws, li) {
        var line = document.createElement("span");
        line.className = "mr-line";
        line.setAttribute("aria-hidden", "true");
        var inner = document.createElement("span");
        inner.className = "mr-inner";
        inner.style.transitionDelay = (li * 0.1) + "s";
        ws.forEach(function (w, wi) {
          inner.appendChild(w);
          if (wi < ws.length - 1) inner.appendChild(document.createTextNode(" "));
        });
        line.appendChild(inner);
        el.appendChild(line);
      });
    }
    group();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { if (!el.classList.contains("mask-play")) group(); });
    }
    var lastW = el.clientWidth;
    window.addEventListener("resize", function () {
      if (el.classList.contains("mask-play")) return;
      var w = el.clientWidth;
      if (Math.abs(w - lastW) > 4) { lastW = w; group(); }
    });
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { el.classList.add("mask-play"); io.disconnect(); }
    }, { rootMargin: "0px 0px -18% 0px", threshold: 0.05 });
    io.observe(el);
  });

  if (!finePointer) return;

  /* ---------- 3. Curseur doré custom (desktop) ---------- */
  var dot = document.createElement("div");
  dot.className = "nx-cursor-dot";
  var ring = document.createElement("div");
  ring.className = "nx-cursor-ring";
  dot.setAttribute("aria-hidden", "true");
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  var mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dot.style.transform = "translate(" + mx + "px," + my + "px)";
    ring.style.transform = "translate(" + rx + "px," + ry + "px)";
    requestAnimationFrame(loop);
  })();
  document.addEventListener("mouseover", function (e) {
    var interactive = e.target.closest("a, button");
    document.body.classList.toggle("nx-cursor-hover", !!interactive);
  }, { passive: true });
  document.addEventListener("mouseleave", function () {
    dot.style.opacity = "0"; ring.style.opacity = "0";
  });
  document.addEventListener("mouseenter", function () {
    dot.style.opacity = "1"; ring.style.opacity = "1";
  });

  /* ---------- 4. Boutons magnétiques ---------- */
  document.querySelectorAll(".nx-btn").forEach(function (b) {
    b.addEventListener("mousemove", function (e) {
      var r = b.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) / r.width;
      var y = (e.clientY - r.top - r.height / 2) / r.height;
      b.style.transform = "translate(" + x * 8 + "px," + (y * 5 - 2) + "px)";
    });
    b.addEventListener("mouseleave", function () { b.style.transform = ""; });
  });

  /* ---------- 5. Tilt 3D subtil sur les cartes ---------- */
  document.querySelectorAll(".nx-card, .nx-project").forEach(function (c) {
    c.style.transformStyle = "preserve-3d";
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = "perspective(900px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 6) + "deg) translateY(-4px)";
      c.style.transition = "transform 0.08s linear, border-color 0.3s, box-shadow 0.3s";
    });
    c.addEventListener("mouseleave", function () {
      c.style.transform = "";
      c.style.transition = "";
    });
  });
})();
