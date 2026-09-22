/* Mega-menu Expertises — ouverture au survol/clic, bascule de catégorie, accordéon mobile */
(function () {
  var wrap = document.querySelector('.nx-has-mega');
  var trigger = document.querySelector('.nx-mega-trigger');
  var mega = document.getElementById('nx-mega');

  if (wrap && trigger && mega) {
    var timer;
    var open = function () { clearTimeout(timer); mega.hidden = false; trigger.setAttribute('aria-expanded', 'true'); };
    var close = function () { mega.hidden = true; trigger.setAttribute('aria-expanded', 'false'); };
    var delayClose = function () { timer = setTimeout(close, 140); };

    wrap.addEventListener('mouseenter', open);
    wrap.addEventListener('mouseleave', delayClose);
    mega.addEventListener('mouseenter', function () { clearTimeout(timer); });
    mega.addEventListener('mouseleave', delayClose);
    trigger.addEventListener('click', function (e) { e.preventDefault(); mega.hidden ? open() : close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('click', function (e) { if (!mega.contains(e.target) && !wrap.contains(e.target)) close(); });

    var cats = mega.querySelectorAll('.nx-mega-cat');
    var panels = mega.querySelectorAll('.nx-mega-panel');
    var activate = function (name) {
      cats.forEach(function (c) { c.classList.toggle('is-active', c.dataset.cat === name); });
      panels.forEach(function (p) { p.classList.toggle('is-active', p.dataset.cat === name); });
    };
    cats.forEach(function (c) {
      c.addEventListener('mouseenter', function () { activate(c.dataset.cat); });
      c.addEventListener('focus', function () { activate(c.dataset.cat); });
    });
  }

  /* Accordéon mobile */
  document.querySelectorAll('.nx-macc-head').forEach(function (h) {
    h.addEventListener('click', function () {
      var on = h.getAttribute('aria-expanded') === 'true';
      h.setAttribute('aria-expanded', String(!on));
      var body = h.nextElementSibling;
      if (body) body.hidden = on;
    });
  });
})();
