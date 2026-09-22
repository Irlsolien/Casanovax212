/* Page check-up : préparation d'une demande WhatsApp, envoi final par l'utilisateur. */
(function () {
  "use strict";
  var form = document.getElementById("cu-form");
  if (!form) return;

  var params = new URLSearchParams(location.search);
  if (params.get("secteur") === "sante" && !form.activite.value) form.activite.value = "Cabinet médical / clinique";
  if (params.get("offre")) form.dataset.offre = params.get("offre");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var status = form.querySelector(".cu-status");
    var nom = form.nom.value.trim();
    var activite = form.activite.value.trim();
    var ville = form.ville.value.trim();
    var tel = form.telephone.value.trim();
    var lien = form.lien.value.trim();
    var objectif = form.objectif.value.trim();
    var budget = form.budget.value.trim();
    var offre = form.dataset.offre || "non précisée";

    if (!nom || !activite || !ville || !tel || !objectif) {
      status.textContent = "Merci de remplir les champs obligatoires et de choisir votre priorité.";
      return;
    }
    if (form._honey.value) return;

    var message = [
      "Bonjour CASANOVAX, je souhaite recevoir mon check-up digital gratuit.",
      "",
      "Nom : " + nom,
      "Activité : " + activite,
      "Ville : " + ville,
      "Téléphone : " + tel,
      "Lien : " + (lien || "non fourni"),
      "Priorité : " + objectif,
      "Budget : " + (budget || "à discuter"),
      "Offre consultée : " + offre
    ].join("\n");

    try { localStorage.setItem("cx_lead_modal_v1", JSON.stringify({ ts: Date.now(), done: true })); } catch (_) {}
    status.textContent = "WhatsApp va s’ouvrir avec votre demande. Relisez-la puis appuyez sur Envoyer.";
    window.open("https://wa.me/212645057363?text=" + encodeURIComponent(message), "_blank", "noopener");
  });
})();
