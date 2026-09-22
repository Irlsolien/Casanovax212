/* Capture non intrusive : prépare un message WhatsApp, jamais d'envoi automatique. */
(function () {
  "use strict";
  var KEY = "cx_lead_modal_v1";
  var SHOW_AFTER_MS = 20000;
  var RESHOW_DAYS = 7;
  if (/check-up\.html$/.test(location.pathname)) return;

  function seenRecently() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return false;
      var d = JSON.parse(raw);
      if (d.done) return true;
      return (Date.now() - d.ts) < RESHOW_DAYS * 864e5;
    } catch (_) { return false; }
  }
  function mark(done) {
    try { localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), done: !!done })); } catch (_) {}
  }
  if (seenRecently()) return;

  var wrap = document.createElement("div");
  wrap.className = "nx-lead";
  wrap.innerHTML =
    '<div class="nx-lead-backdrop" data-lead-close></div>' +
    '<div class="nx-lead-box" role="dialog" aria-modal="true" aria-labelledby="nx-lead-title">' +
      '<button class="nx-lead-x" type="button" data-lead-close aria-label="Fermer">&times;</button>' +
      '<p class="nx-lead-eyebrow">Diagnostic offert</p>' +
      '<h2 id="nx-lead-title">Votre présence digitale transforme-t-elle les recherches en <em>demandes ?</em></h2>' +
      '<p class="nx-lead-text">Décrivez votre activité. Nous préparons votre demande dans WhatsApp : vous la relisez avant de l’envoyer.</p>' +
      '<form class="nx-lead-form" novalidate>' +
        '<input type="text" name="_honey" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">' +
        '<label>Votre nom<input type="text" name="nom" required autocomplete="name" placeholder="Nom et prénom"></label>' +
        '<label>Votre activité<input type="text" name="activite" required placeholder="Ex. cabinet médical, restaurant…"></label>' +
        '<label>WhatsApp / téléphone<input type="tel" name="telephone" required autocomplete="tel" placeholder="06 XX XX XX XX"></label>' +
        '<button class="nx-btn nx-btn--gold nx-lead-submit" type="submit">Préparer sur WhatsApp</button>' +
        '<p class="nx-lead-note">Aucune donnée n’est envoyée automatiquement. <a href="' +
        (location.pathname.indexOf("/blog/") !== -1 ? "../check-up.html" : "check-up.html") +
        '">Utiliser le formulaire complet</a></p>' +
        '<p class="nx-lead-status" role="status" aria-live="polite"></p>' +
      '</form>' +
    '</div>';

  function open() {
    document.body.appendChild(wrap);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () { wrap.classList.add("is-open"); });
    mark(false);
  }
  function close() {
    wrap.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 300);
  }
  wrap.addEventListener("click", function (e) { if (e.target.closest("[data-lead-close]")) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && wrap.parentNode) close(); });

  var form = wrap.querySelector(".nx-lead-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var status = wrap.querySelector(".nx-lead-status");
    var nom = form.nom.value.trim();
    var activite = form.activite.value.trim();
    var tel = form.telephone.value.trim();
    if (!nom || !activite || !tel) { status.textContent = "Merci de remplir les trois champs."; return; }
    if (form._honey.value) return;
    var message = "Bonjour CASANOVAX, je souhaite un check-up digital gratuit.\n\nNom : " + nom + "\nActivité : " + activite + "\nTéléphone : " + tel;
    mark(true);
    status.textContent = "Relisez votre demande dans WhatsApp puis appuyez sur Envoyer.";
    window.open("https://wa.me/212645057363?text=" + encodeURIComponent(message), "_blank", "noopener");
  });

  var opened = false;
  function trigger() { if (!opened) { opened = true; open(); } }
  setTimeout(trigger, SHOW_AFTER_MS);
  window.addEventListener("scroll", function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0 && window.scrollY / h > 0.35) { window.removeEventListener("scroll", onScroll); trigger(); }
  }, { passive: true });
})();
