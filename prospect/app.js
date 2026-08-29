/* CASANOVAX Prospect — tout tourne dans le téléphone, aucune donnée envoyée ailleurs. */

const SECTORS = {
  "restaurant": '["amenity"="restaurant"]',
  "café": '["amenity"="cafe"]',
  "coiffeur": '["shop"="hairdresser"]',
  "institut de beauté": '["shop"="beauty"]',
  "dentiste": '["amenity"="dentist"]',
  "médecin": '["amenity"="doctors"]',
  "kiné": '["healthcare"="physiotherapist"]',
  "pharmacie": '["amenity"="pharmacy"]',
  "avocat": '["office"="lawyer"]',
  "agence immobilière": '["office"="estate_agent"]',
  "salle de sport": '["leisure"="fitness_centre"]',
  "garage auto": '["shop"="car_repair"]',
  "hôtel": '["tourism"="hotel"]',
  "boulangerie": '["shop"="bakery"]',
  "opticien": '["shop"="optician"]',
  "vétérinaire": '["amenity"="veterinary"]',
};

// Chiffres de début (après indicatif) qui identifient un MOBILE.
// Sert à écarter les lignes fixes (pas de WhatsApp). Si l'indicatif n'est pas
// listé, on ne tranche pas (statut "inconnu" → WhatsApp autorisé).
const MOBILE_RULES = {
  "212": ["6", "7"],            // Maroc : 06/07 mobile, 05 fixe
  "33": ["6", "7"],             // France
  "34": ["6", "7"],             // Espagne
  "32": ["4"],                  // Belgique
  "213": ["5", "6", "7"],       // Algérie
  "216": ["2", "4", "5", "9"],  // Tunisie
  "971": ["5"],                 // Émirats
  "966": ["5"],                 // Arabie Saoudite
  "44": ["7"],                  // Royaume-Uni
  "49": ["1"],                  // Allemagne
  "20": ["1"],                  // Égypte
  "221": ["7"],                 // Sénégal
};

// Indicatifs pour convertir un numéro local (commençant par 0) en international.
const CALLING = {
  "morocco": "212", "maroc": "212", "france": "33", "belgium": "32", "belgique": "32",
  "spain": "34", "espagne": "34", "united arab emirates": "971", "uae": "971",
  "canada": "1", "united states": "1", "usa": "1", "united kingdom": "44", "uk": "44",
  "germany": "49", "allemagne": "49", "italy": "39", "italie": "39", "portugal": "351",
  "netherlands": "31", "switzerland": "41", "suisse": "41", "tunisia": "216", "tunisie": "216",
  "algeria": "213", "algérie": "213", "senegal": "221", "sénégal": "221", "egypt": "20",
  "saudi arabia": "966", "qatar": "974", "turkey": "90", "turquie": "90",
};

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
// Proxy same-origin (fonction serverless) : pas de CORS, bascule de miroirs côté serveur.
const OVERPASS_API = "/api/overpass";
const STORE_KEY = "cx_treated_v1";

const $ = (id) => document.getElementById(id);
let selectedSectors = new Set(Object.keys(SECTORS));
let leads = [];

/* ---------- historique (localStorage) ---------- */
function loadTreated() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
  catch { return {}; }
}
function saveTreated(t) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(t)); } catch {}
}
function markTreated(id, status) {
  const t = loadTreated(); t[id] = status; saveTreated(t);
}

/* ---------- téléphone ---------- */
function callingCode(country) {
  return CALLING[(country || "").trim().toLowerCase()] || "212";
}
function normalizePhone(raw, country) {
  let d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  const cc = callingCode(country);
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith(cc)) return d;
  if (d.startsWith("0")) return cc + d.slice(1);
  return d;
}

/* ---------- message ---------- */
function message(name, city) {
  return `Bonjour ${name} 👋

Je suis tombé sur votre établissement à ${city} en cherchant en ligne. Une remarque, en passant : on vous trouve en ligne mais vous n'avez pas de site, donc beaucoup de gens cherchent, ne trouvent rien de solide, puis vont chez le concurrent.

On construit justement le système digital de commerces comme le vôtre (site clair + Google + avis). Je peux vous montrer en 2 minutes ce que ça change ?

— l'équipe CASANOVAX`;
}
function waLink(phone, msg, country) {
  const d = normalizePhone(phone, country);
  return d ? `https://wa.me/${d}?text=${encodeURIComponent(msg)}` : "";
}

// mobile / fixe / unknown à partir du numéro et du pays.
function phoneKind(raw, country) {
  const d = normalizePhone(raw, country);
  if (!d) return "unknown";
  const cc = callingCode(country);
  const nat = d.startsWith(cc) ? d.slice(cc.length) : d;
  const rules = MOBILE_RULES[cc];
  if (!rules) return "unknown";
  return rules.some((p) => nat.startsWith(p)) ? "mobile" : "fixe";
}

// Une fiche OSM peut lister plusieurs numéros : on choisit un mobile si possible.
function pickBestPhone(raw, country) {
  const nums = String(raw).split(/[;,/]+/).map((s) => s.trim()).filter(Boolean);
  let fallback = null;
  for (const n of nums) {
    const k = phoneKind(n, country);
    if (k === "mobile") return { number: n, kind: "mobile" };
    if (!fallback) fallback = { number: n, kind: k };
  }
  return fallback || { number: raw, kind: phoneKind(raw, country) };
}

/* ---------- réseau ---------- */
async function geocode(city, country) {
  const url = `${NOMINATIM}?q=${encodeURIComponent(city + ", " + country)}&format=json&limit=1`;
  const r = await fetch(url, { headers: { "Accept": "application/json" } });
  const data = await r.json();
  if (!data.length) return null;
  const b = data[0].boundingbox; // [south, north, west, east]
  return [parseFloat(b[0]), parseFloat(b[2]), parseFloat(b[1]), parseFloat(b[3])];
}
function buildQuery(bbox, sectors) {
  const box = `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;
  const parts = [...sectors].map((s) => `  nwr${SECTORS[s]}(${box});`).join("\n");
  return `[out:json][timeout:25];\n(\n${parts}\n);\nout center tags;`;
}
async function overpass(query) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 25000);
  try {
    const r = await fetch(OVERPASS_API + "?data=" + encodeURIComponent(query),
                          { signal: ctl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return (await r.json()).elements || [];
  } finally {
    clearTimeout(timer);
  }
}
function sectorOf(tags) {
  for (const [name, flt] of Object.entries(SECTORS)) {
    const m = flt.match(/\["([^"]+)"="([^"]+)"\]/);
    if (m && tags[m[1]] === m[2]) return name;
  }
  return "commerce";
}

/* ---------- pipeline ---------- */
function addElements(els, seen, city, country) {
  let added = 0;
  for (const el of els) {
    const t = el.tags || {};
    if (!t.name) continue;
    const key = t.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    const website = t.website || t["contact:website"] || "";
    if (website) continue;                       // signal : PAS de site
    const rawPhone = t["contact:mobile"] || t.phone || t["contact:phone"] || "";
    if (!rawPhone) continue;                        // besoin d'un numéro pour contacter
    seen.add(key);
    const best = pickBestPhone(rawPhone, country);
    leads.push({ id: `${el.type}${el.id}`, name: t.name.trim(),
                 sector: sectorOf(t), city, country,
                 phone: best.number, kind: best.kind });
    added++;
  }
  return added;
}

async function search() {
  const city = $("city").value.trim() || "Casablanca";
  const country = $("country").value.trim() || "Morocco";
  const sectors = [...selectedSectors];
  if (!sectors.length) { setStatus("Choisis au moins un secteur.", true); return; }

  $("search").disabled = true;
  setStatus("Localisation de " + city + "…");
  try {
    const bbox = await geocode(city, country);
    if (!bbox) { setStatus("Ville introuvable : " + city + ", " + country, true); return; }

    // Recherche secteur par secteur : plus léger, plus fiable, résultats en direct.
    leads = [];
    const seen = new Set();
    let ok = 0, fail = 0;
    for (let i = 0; i < sectors.length; i++) {
      setStatus(`Recherche… ${sectors[i]} (${i + 1}/${sectors.length}) · ${leads.length} trouvés`);
      try {
        const els = await overpass(buildQuery(bbox, [sectors[i]]));
        addElements(els, seen, city, country);
        const rank = { mobile: 0, unknown: 1, fixe: 2 };
        leads.sort((a, b) => (rank[a.kind] - rank[b.kind]) || a.name.localeCompare(b.name));
        render();
        ok++;
      } catch (e) {
        fail++;
      }
    }
    if (!leads.length) {
      setStatus(fail
        ? "Serveurs OpenStreetMap occupés. Réessaie dans une minute."
        : "Aucun commerce sans site trouvé ici. Change de ville ou de secteur.", !!fail);
    } else {
      setStatus(fail ? `${leads.length} prospects (${fail} secteur(s) non chargé(s), réessaie).` : "");
    }
  } catch (e) {
    setStatus("Erreur : " + e.message + ". Réessaie dans un instant.", true);
  } finally {
    $("search").disabled = false;
  }
}

/* ---------- rendu ---------- */
function setStatus(msg, err) {
  const s = $("status"); s.textContent = msg; s.classList.toggle("err", !!err);
}
function updateCounters(wa, fixe, done) {
  $("counters").innerHTML = `<b>${wa}</b> WhatsApp · ${fixe} fixes<br>${done} traités`;
}
function render() {
  const treated = loadTreated();
  const showDone = $("showDone").checked;
  const hideFixed = $("hideFixed").checked;
  const list = $("list");
  list.innerHTML = "";
  let shown = 0, done = 0, waCount = 0, fixeCount = 0;

  for (const l of leads) {
    const isFixe = l.kind === "fixe";
    if (isFixe) fixeCount++; else waCount++;
    const st = treated[l.id];
    if (st) done++;
    if (isFixe && hideFixed && !st) continue;
    if (st && !showDone) continue;
    shown += st ? 0 : 1;

    const msg = message(l.name, l.city);
    const card = document.createElement("div");
    card.className = "card" + (st ? " done" : "");
    card.innerHTML = `
      <div class="h"><div><div class="name"></div><div class="tag"></div></div></div>
      <div class="meta"></div>
      <div class="msg"></div>
      <div class="actions"></div>`;
    card.querySelector(".name").textContent = l.name;
    const tag = card.querySelector(".tag");
    tag.textContent = st ? (st === "sent" ? "✓ contacté" : "passé")
                         : (isFixe ? "☎ fixe · pas de WhatsApp" : "pas de site");
    if (isFixe) tag.classList.add("tag-fixe");
    card.querySelector(".meta").textContent = `${l.sector} · ${l.city} · ${l.phone}`;
    card.querySelector(".msg").textContent = msg;

    const actions = card.querySelector(".actions");
    if (isFixe) {
      const call = document.createElement("a");
      call.className = "call";
      call.href = "tel:" + normalizePhone(l.phone, l.country);
      call.textContent = "Appeler";
      call.addEventListener("click", () => { markTreated(l.id, "sent"); setTimeout(render, 400); });
      actions.appendChild(call);
    } else {
      const wa = document.createElement("a");
      wa.className = "wa"; wa.target = "_blank"; wa.rel = "noopener";
      wa.href = waLink(l.phone, msg, l.country);
      wa.textContent = "Ouvrir WhatsApp";
      wa.addEventListener("click", () => { markTreated(l.id, "sent"); setTimeout(render, 400); });
      actions.appendChild(wa);
    }
    const skip = document.createElement("button");
    skip.className = "skip"; skip.textContent = "Passer";
    skip.addEventListener("click", () => { markTreated(l.id, "skip"); render(); });
    actions.appendChild(skip);
    list.appendChild(card);
  }

  if (!shown) {
    list.innerHTML = `<div class="empty">${leads.length
      ? (hideFixed && fixeCount && !waCount
          ? "Uniquement des lignes fixes ici (pas de WhatsApp).<br>Décoche « Masquer les fixes » pour les appeler, ou change de secteur."
          : "Tous les prospects de cette recherche sont traités. 🎉<br>Change de ville ou de secteur.")
      : "Aucun résultat. Lance une recherche."}</div>`;
  }
  updateCounters(waCount, fixeCount, done);
}

/* ---------- secteurs UI ---------- */
function buildSectorChips() {
  const box = $("sectorList");
  for (const name of Object.keys(SECTORS)) {
    const chip = document.createElement("span");
    chip.className = "chip on";
    chip.textContent = name;
    chip.addEventListener("click", () => {
      if (selectedSectors.has(name)) { selectedSectors.delete(name); chip.classList.remove("on"); }
      else { selectedSectors.add(name); chip.classList.add("on"); }
      $("secCount").textContent = `(${selectedSectors.size})`;
    });
    box.appendChild(chip);
  }
  $("secCount").textContent = `(${selectedSectors.size})`;
}

/* ---------- init ---------- */
buildSectorChips();
$("search").addEventListener("click", search);
$("showDone").addEventListener("change", render);
$("hideFixed").addEventListener("change", render);
$("reset").addEventListener("click", () => {
  if (confirm("Effacer tout l'historique des prospects traités ?")) {
    saveTreated({}); render();
  }
});
updateCounters(0, 0, 0);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/prospect/sw.js").catch(() => {});
}
