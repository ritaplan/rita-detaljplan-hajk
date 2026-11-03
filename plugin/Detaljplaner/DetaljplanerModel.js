import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Circle, Fill, Stroke, Style } from "ol/style";

import { hfetch } from "../../utils/FetchWrapper";
import {
  DEFAULT_LAYERS,
  GEOJSON_PROJECTION,
  HIGHLIGHT_STYLES,
  WFS_PROPERTIES,
  WFS_RULES_LAYER,
} from "./constants";
import { groupAreas, parseJson, sortFeatures } from "./utils";

/**
 * Frågar kartservern (GeoServer) om detaljplanerna och ritar markeringar i kartan.
 * Uppgifterna hämtas med ett enda GetFeatureInfo-anrop (lagren planmosaik och plan_bestammelser).
 * Alla bestämmelser i en plan hämtas med WFS.
 */
export default class DetaljplanerModel {
  #map;
  #options;
  #highlight;
  #marker;
  #token = 0;
  #areaGeometry = null;

  constructor({ map, options }) {
    this.#map = map;
    this.#options = options;

    // layerType "system" håller lagren borta från lagerlistan.
    this.#highlight = new VectorLayer({
      source: new VectorSource(),
      name: "pluginDetaljplanerMarkering",
      caption: "Detaljplaner, markering",
      layerType: "system",
      zIndex: 5000,
    });
    this.#marker = new VectorLayer({
      source: new VectorSource(),
      name: "pluginDetaljplanerKlickpunkt",
      caption: "Detaljplaner, klickpunkt",
      layerType: "system",
      zIndex: 5001,
    });
    map.addLayer(this.#highlight);
    map.addLayer(this.#marker);
  }

  destroy() {
    this.#map.removeLayer(this.#highlight);
    this.#map.removeLayer(this.#marker);
  }

  get isConfigured() {
    return Boolean(this.#options.infoUrl);
  }

  /** Visas något av kartlagren som är inställda som "detaljplanelager" (options.layerIds)? */
  isLayerVisible() {
    const ids = this.#options.layerIds || [];
    if (ids.length === 0) return false;
    return this.#map
      .getAllLayers()
      .some((layer) => ids.includes(layer.get("name")) && layer.getVisible());
  }

  #mapProjection() {
    return this.#map.getView().getProjection().getCode();
  }

  /** Klickpunkten i Web Mercator, som bestämmelsernas geometri. */
  toGeoJsonProjection(coordinate) {
    return transform(coordinate, this.#mapProjection(), GEOJSON_PROJECTION);
  }

  /**
   * Frågar om planen och bestämmelserna där man klickade.
   * Returnerar undefined om ett nyare klick har kommit under tiden, annars { plan, rows }.
   */
  async query(event) {
    const token = (this.#token += 1);
    const layers = this.#options.layers || DEFAULT_LAYERS;
    const size = this.#map.getSize();
    const extent = this.#map.getView().calculateExtent(size);
    const params = new URLSearchParams({
      SERVICE: "WMS",
      VERSION: "1.1.1",
      REQUEST: "GetFeatureInfo",
      LAYERS: layers,
      QUERY_LAYERS: layers,
      STYLES: "",
      SRS: this.#mapProjection(),
      BBOX: extent.join(","),
      WIDTH: Math.round(size[0]),
      HEIGHT: Math.round(size[1]),
      X: Math.round(event.pixel[0]),
      Y: Math.round(event.pixel[1]),
      INFO_FORMAT: "application/json",
      FEATURE_COUNT: "200",
    });
    const response = await hfetch(`${this.#options.infoUrl}?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (token !== this.#token) return undefined;
    return sortFeatures(json);
  }

  /** Alla bestämmelser i en plan (kräver options.wfsUrl). Returnerar områden med sina bestämmelser. */
  async fetchAllRules(planId) {
    const params = new URLSearchParams({
      service: "WFS",
      version: "2.0.0",
      request: "GetFeature",
      typeNames: WFS_RULES_LAYER,
      outputFormat: "application/json",
      cql_filter: `plan='${String(planId).replace(/'/g, "''")}'`,
      propertyName: WFS_PROPERTIES,
    });
    const response = await hfetch(`${this.#options.wfsUrl}?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return groupAreas((json.features || []).map((f) => f.properties));
  }

  get hasWfs() {
    return Boolean(this.#options.wfsUrl);
  }

  // --- markeringar i kartan --------------------------------------------------------------------------------
  #style(kind) {
    const s = HIGHLIGHT_STYLES[kind];
    return new Style({
      stroke: new Stroke({ color: s.stroke, width: s.width }),
      fill: new Fill({ color: s.fill }),
    });
  }

  #show(geojson, kind) {
    const source = this.#highlight.getSource();
    source.clear();
    const geometry =
      typeof geojson === "string" ? parseJson(geojson, null) : geojson;
    if (!geometry) return;
    const feature = new GeoJSON().readFeature(
      { type: "Feature", geometry, properties: {} },
      {
        dataProjection: GEOJSON_PROJECTION,
        featureProjection: this.#mapProjection(),
      }
    );
    feature.setStyle(this.#style(kind));
    source.addFeature(feature);
  }

  /** Planens användningsyta (området man klickade i) ramas in. */
  showArea(geojson) {
    this.#areaGeometry = geojson || null;
    this.#restoreArea();
  }

  /** Markerar en enskild bestämmelses yta (när man pekar på dess kort). */
  showHover(geojson) {
    this.#show(geojson, "hover");
  }

  hideHover() {
    this.#restoreArea();
  }

  #restoreArea() {
    if (this.#areaGeometry) {
      this.#show(this.#areaGeometry, "area");
    } else {
      this.#highlight.getSource().clear();
    }
  }

  showMarker(coordinate) {
    const source = this.#marker.getSource();
    source.clear();
    const feature = new Feature(new Point(coordinate));
    feature.setStyle(
      new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: "#fff" }),
          stroke: new Stroke({ color: "#e8590c", width: 3 }),
        }),
      })
    );
    source.addFeature(feature);
  }

  clear() {
    this.#areaGeometry = null;
    this.#highlight.getSource().clear();
    this.#marker.getSource().clear();
  }

  /** Avbryter pågående svar (de ignoreras när de kommer). */
  cancel() {
    this.#token += 1;
  }
}
