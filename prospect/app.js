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
// Plusieurs miroirs Overpass : si l'un est saturé (rate-limit), on bascule.
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
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
  return `[out:json][timeout:90];\n(\n${parts}\n);\nout center tags;`;
}
async function overpass(query) {
  let lastErr;
  for (const url of OVERPASS_MIRRORS) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
      });
      if (!r.ok) { lastErr = new Error("HTTP " + r.status); continue; }
      return (await r.json()).elements || [];
    } catch (e) {
      lastErr = e; // miroir injoignable ou saturé → on essaie le suivant
    }
  }
  throw lastErr || new Error("Overpass indisponible");
}
function sectorOf(tags) {
  for (const [name, flt] of Object.entries(SECTORS)) {
    const m = flt.match(/\["([^"]+)"="([^"]+)"\]/);
    if (m && tags[m[1]] === m[2]) return name;
  }
  return "commerce";
}

/* ---------- pipeline ---------- */
async function search() {
  const city = $("city").value.trim() || "Casablanca";
  const country = $("country").value.trim() || "Morocco";
  setStatus("Localisation de " + city + "…");
  $("search").disabled = true;
  try {
    const bbox = await geocode(city, country);
    if (!bbox) { setStatus("Ville introuvable : " + city + ", " + country, true); return; }
    setStatus("Recherche des commerces…");
    const els = await overpass(buildQuery(bbox, selectedSectors));
    const seen = new Set();
    leads = [];
    for (const el of els) {
      const t = el.tags || {};
      if (!t.name) continue;
      const key = t.name.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const website = t.website || t["contact:website"] || "";
      if (website) continue; // signal : PAS de site
      const phone = t.phone || t["contact:phone"] || t["contact:mobile"] || "";
      if (!phone) continue; // besoin d'un numéro pour WhatsApp
      leads.push({
        id: `${el.type}${el.id}`,
        name: t.name.trim(),
        sector: sectorOf(t),
        city, country, phone,
      });
    }
    render();
    setStatus("");
  } catch (e) {
    setStatus("Erreur réseau : " + e.message + ". Réessaie dans un instant.", true);
  } finally {
    $("search").disabled = false;
  }
}

/* ---------- rendu ---------- */
function setStatus(msg, err) {
  const s = $("status"); s.textContent = msg; s.classList.toggle("err", !!err);
}
function updateCounters(shown, done) {
  $("counters").innerHTML = `<b>${shown}</b> à contacter<br>${done} traités`;
}
function render() {
  const treated = loadTreated();
  const showDone = $("showDone").checked;
  const list = $("list");
  list.innerHTML = "";
  let shown = 0, done = 0;

  for (const l of leads) {
    const st = treated[l.id];
    if (st) done++;
    if (st && !showDone) continue;
    shown += st ? 0 : 1;

    const msg = message(l.name, l.city);
    const link = waLink(l.phone, msg, l.country);
    const card = document.createElement("div");
    card.className = "card" + (st ? " done" : "");
    card.innerHTML = `
      <div class="h">
        <div><div class="name"></div><div class="tag"></div></div>
      </div>
      <div class="meta"></div>
      <div class="msg"></div>
      <div class="actions">
        <a class="wa" target="_blank" rel="noopener">Ouvrir WhatsApp</a>
        <button class="skip">Passer</button>
      </div>`;
    card.querySelector(".name").textContent = l.name;
    card.querySelector(".tag").textContent = st ? (st === "sent" ? "✓ envoyé" : "passé") : "pas de site";
    card.querySelector(".meta").textContent = `${l.sector} · ${l.city} · ${l.phone}`;
    card.querySelector(".msg").textContent = msg;
    const wa = card.querySelector(".wa");
    wa.href = link;
    wa.addEventListener("click", () => { markTreated(l.id, "sent"); setTimeout(render, 400); });
    card.querySelector(".skip").addEventListener("click", () => { markTreated(l.id, "skip"); render(); });
    list.appendChild(card);
  }

  if (!shown && !showDone) {
    list.innerHTML = `<div class="empty">${leads.length
      ? "Tous les prospects de cette recherche sont traités. 🎉<br>Change de ville ou de secteur."
      : "Aucun résultat. Lance une recherche."}</div>`;
  }
  updateCounters(leads.length - done, done);
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
$("reset").addEventListener("click", () => {
  if (confirm("Effacer tout l'historique des prospects traités ?")) {
    saveTreated({}); render();
  }
});
updateCounters(0, 0);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/prospect/sw.js").catch(() => {});
}
