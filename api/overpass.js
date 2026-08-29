// Fonction serverless Vercel : proxy Overpass.
// L'app (PWA) appelle /api/overpass sur son propre domaine (aucun souci CORS),
// et c'est le serveur qui interroge OpenStreetMap. Les miroirs sont interrogés
// EN PARALLÈLE : le premier qui répond correctement gagne. Beaucoup plus fiable
// que d'attendre un seul serveur souvent saturé.

const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.osm.jp/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
];

async function queryMirror(url, data) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(data),
    signal: AbortSignal.timeout(9000),
  });
  if (!resp.ok) throw new Error("HTTP " + resp.status + " @ " + url);
  const json = await resp.json();
  if (!json || !Array.isArray(json.elements)) throw new Error("réponse invalide @ " + url);
  // Overpass renvoie parfois HTTP 200 avec 0 élément + un "remark" d'erreur
  // (timeout, surcharge). On le traite comme un échec pour basculer de miroir.
  if (json.remark && /timed out|error|rate|load|dispatcher/i.test(json.remark)) {
    throw new Error("remark: " + json.remark + " @ " + url);
  }
  return json;
}

module.exports = async (req, res) => {
  const data = (req.query && req.query.data) || "";
  if (!data) {
    res.status(400).json({ error: "paramètre 'data' manquant" });
    return;
  }
  try {
    const json = await Promise.any(MIRRORS.map((m) => queryMirror(m, data)));
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json(json);
  } catch (e) {
    const detail = e && e.errors ? e.errors.map((x) => x.message || x.name).join(" | ")
                                 : String(e);
    res.status(503).json({ error: "Overpass indisponible", detail });
  }
};
