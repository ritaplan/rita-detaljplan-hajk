import { MONTHS } from "./constants";

export function formatDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text || "");
  return m
    ? `${parseInt(m[3], 10)} ${MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}`
    : "";
}

export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

export function parseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

// Bara http och https får bli länkar (länkarna kommer ur databasen).
export function isHttpUrl(url) {
  return /^https?:\/\//i.test(url || "");
}

// --- geometri: träffar klicket bestämmelsens egen yta? ---------------------------------------------------------
function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function inPolygon(x, y, rings) {
  if (!inRing(x, y, rings[0])) return false;
  return !rings.slice(1).some((hole) => inRing(x, y, hole));
}

// geometry är GeoJSON och coordinate [x, y] i samma koordinatsystem (Web Mercator).
export function covers(geometry, coordinate) {
  if (!geometry) return false;
  const [x, y] = coordinate;
  if (geometry.type === "Polygon") return inPolygon(x, y, geometry.coordinates);
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((rings) => inPolygon(x, y, rings));
  }
  return false;
}

// --- bestämmelser -----------------------------------------------------------------------------------------------
export function groupAreas(rows) {
  const byId = new Map();
  rows.forEach((row) => {
    if (!byId.has(row.omrade_id)) {
      byId.set(row.omrade_id, {
        id: row.omrade_id,
        beteckning: row.omrade_beteckning,
        anvandningsform: row.anvandningsform,
        rows: [],
      });
    }
    byId.get(row.omrade_id).rows.push(row);
  });
  return [...byId.values()];
}

export function orderRules(rows) {
  return rows
    .slice()
    .sort(
      (a, b) =>
        a.ordning - b.ordning ||
        String(a.beteckning || "").localeCompare(
          String(b.beteckning || ""),
          "sv"
        )
    );
}

// Samma bestämmelse kan ligga på flera egenskapsytor: visa den en gång, och som "här" om någon av dem gäller här.
export function uniqueRules(rows) {
  const seen = new Map();
  const out = [];
  rows.forEach((row) => {
    const key = [
      row.kategori,
      row.beteckning,
      row.monster,
      row.text,
      row.motiv,
    ].join("|");
    if (!seen.has(key)) {
      seen.set(key, out.length);
      out.push({ ...row });
    } else if (row.here) {
      const first = out[seen.get(key)];
      first.here = true;
      first.egen_geojson = row.egen_geojson;
    }
  });
  return out;
}

export function areaTitle(area) {
  return [area.beteckning, area.anvandningsform].filter(Boolean).join(" · ");
}

// Delar ett område i det som gäller överallt (användning) och egenskaperna: de där klicket ligger och övriga.
export function splitArea(area, coordinate) {
  const use = orderRules(area.rows.filter((r) => r.kategori === "anvandning"));
  const property = uniqueRules(
    area.rows
      .filter((r) => r.kategori === "egenskap")
      .map((r) => ({
        ...r,
        here: coordinate
          ? covers(parseJson(r.egen_geojson, null), coordinate)
          : false,
      }))
  );
  return {
    use,
    here: orderRules(property.filter((r) => r.here)),
    other: orderRules(property.filter((r) => !r.here)),
  };
}

// Svaret från GetFeatureInfo innehåller både planen och dess bestämmelser; sortera ut dem.
export function sortFeatures(json) {
  let plan = null;
  const rows = [];
  (json?.features || []).forEach((f) => {
    const p = f.properties || {};
    if ("kategori" in p) {
      rows.push(p);
    } else if ("visningsstatus" in p && "namn" in p) {
      plan = plan || p;
    }
  });
  return { plan, rows };
}
