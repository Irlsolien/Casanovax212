// Fonction serverless Vercel : proxy Overpass.
// L'app (PWA) appelle /api/overpass sur son propre domaine (aucun souci CORS),
// et c'est le serveur qui interroge OpenStreetMap, avec bascule de miroirs.

const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

module.exports = async (req, res) => {
  const data = (req.query && req.query.data) || "";
  if (!data) {
    res.status(400).json({ error: "paramètre 'data' manquant" });
    return;
  }

  let lastErr = "";
  for (const url of MIRRORS) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(data),
        signal: AbortSignal.timeout(22000),
      });
      if (!resp.ok) { lastErr = "HTTP " + resp.status; continue; }
      const json = await resp.json();
      // Cache CDN 5 min : des recherches identiques ne retapent pas Overpass.
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
      res.status(200).json(json);
      return;
    } catch (e) {
      lastErr = (e && e.name) || String(e);
    }
  }
  res.status(503).json({ error: "Overpass indisponible", detail: lastErr });
};
