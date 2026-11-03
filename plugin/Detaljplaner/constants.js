// Lagren i kartservern (GeoServer, arbetsytan planmosaik) som panelen frågar. Se databas/publicering.sql i
// rita-detaljplan-origomap.
export const DEFAULT_LAYERS = "plan_bestammelser,planmosaik";
export const WFS_RULES_LAYER = "plan_bestammelser";
export const WFS_PROPERTIES =
  "plan,omrade_id,omrade_beteckning,anvandningsform,kategori,beteckning,ordning,text,motiv,monster,fyllfarg,egen_geojson";

// Bestämmelsernas geometri (egen_geojson) levereras alltid i Web Mercator, oavsett kartans koordinatsystem.
export const GEOJSON_PROJECTION = "EPSG:3857";

// "tone" är en färg i MUI:s palett (se StatusChip).
export const STATUS = {
  antagen: {
    label: "Antagen",
    tone: "warning",
    note: "Planen är antagen men har ännu inte vunnit laga kraft.",
  },
  gällande: { label: "Gällande", tone: "info", note: "" },
  "gällande, genomförandetiden pågår": {
    label: "Gällande",
    tone: "success",
    note: "Genomförandetiden pågår.",
  },
  "gällande, genomförandetiden har gått ut": {
    label: "Gällande",
    tone: "default",
    note: "Genomförandetiden har gått ut.",
  },
};

export const PATTERN_NAMES = {
  prickmark: "Prickmark",
  korsmark: "Korsmark",
  ringprickad: "Ringprickad mark",
};

export const MONTHS = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
];

// Markeringen på kartan. Färgerna är samma som i Origo-panelen.
export const HIGHLIGHT_STYLES = {
  area: { stroke: "#e8590c", width: 3, fill: "rgba(232,89,12,0.07)" },
  hover: { stroke: "#1c7ed6", width: 4, fill: "rgba(28,126,214,0.22)" },
};
