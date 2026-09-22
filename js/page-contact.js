/* CASANOVAX — variante B · page Contact : accordéon FAQ (une question ouverte à la fois) */
(function () {
  'use strict';

  function ctFaqSetState(item, open) {
    var trigger = item.querySelector('.ct-faq-trigger');
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    item.classList.toggle('is-open', open);
  }

  function ctFaqInit() {
    var root = document.getElementById('ct-faq');
    if (!root) return;
    var items = Array.prototype.slice.call(root.querySelectorAll('.ct-faq-item'));

    items.forEach(function (item) {
      var trigger = item.querySelector('.ct-faq-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        items.forEach(function (other) { ctFaqSetState(other, false); });
        if (!isOpen) ctFaqSetState(item, true);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ctFaqInit);
  } else {
    ctFaqInit();
  }
})();
