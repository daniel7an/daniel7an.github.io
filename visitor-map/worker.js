// Visitor map backend for daniel7an.github.io (Cloudflare Worker + KV).
//
// POST /visit     records the visitor's approximate city (from Cloudflare's
//                 own geolocation; no IP address or user agent is stored).
// GET  /visitors  returns [{lat, lon, n, city, country}] for drawing the map.
//
// Locations are rounded to 1 decimal degree (~10 km) and aggregated per city.

const ALLOWED_ORIGINS = [
  "https://daniel7an.github.io",
  "http://localhost:8000",
];
const KEY = "points";
const MAX_CITIES = 2000;

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

async function load(env) {
  return (await env.VISITS.get(KEY, "json")) || {};
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const headers = cors(origin);

    if (request.method === "OPTIONS") return new Response(null, { headers });

    if (url.pathname === "/visitors" && request.method === "GET") {
      const data = await load(env);
      // Keys are "<country code>:<city>"; older entries carry no city field.
      const points = Object.entries(data).map(([id, { lat, lon, n, city, country }]) => {
        const [cc, name] = id.split(":");
        const hasName = name && !/^-?\d/.test(name);
        return { lat, lon, n, city: city || (hasName ? name : ""), country: country || (cc !== "?" ? cc : "") };
      });
      return Response.json(
        { points, total: points.reduce((s, p) => s + p.n, 0) },
        { headers: { ...headers, "Cache-Control": "public, max-age=60" } },
      );
    }

    if (url.pathname === "/visit" && request.method === "POST") {
      // Only count visits made from the site itself, and skip obvious bots.
      const ua = request.headers.get("User-Agent") || "";
      const cf = request.cf || {};
      if (!ALLOWED_ORIGINS.includes(origin) || /bot|crawl|spider|preview/i.test(ua) || !cf.latitude) {
        return new Response(null, { status: 204, headers });
      }
      const lat = Math.round(parseFloat(cf.latitude) * 10) / 10;
      const lon = Math.round(parseFloat(cf.longitude) * 10) / 10;
      const id = `${cf.country || "?"}:${cf.city || `${lat},${lon}`}`;

      const data = await load(env);
      if (data[id]) data[id].n += 1;
      else if (Object.keys(data).length < MAX_CITIES) {
        data[id] = { lat, lon, n: 1, city: cf.city || "", country: cf.country || "" };
      }
      await env.VISITS.put(KEY, JSON.stringify(data));
      return new Response(null, { status: 204, headers });
    }

    return new Response("Not found", { status: 404, headers });
  },
};
