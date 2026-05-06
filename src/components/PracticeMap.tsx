"use client";

/**
 * Practice map — MapLibre GL JS + OpenFreeMap Positron vector tiles.
 *
 * This component is loaded into /practice via dynamic({ ssr: false }), so
 * top-level imports of maplibre-gl are safe. If you need to change the tile
 * source, swap STYLE_URL — MapLibre can consume any OpenMapTiles-style
 * style JSON. OpenFreeMap is the primary because it is MIT-licensed, free
 * for commercial use, no API key, and donation-funded; MapTiler / Protomaps
 * hosted / a self-hosted PMTiles file on Cloudflare R2 are viable fallbacks.
 */

import { useEffect, useRef, useState } from "react";
import maplibregl, {
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type Map as MapLibreMap,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface TempleFeature {
  slug: string;
  name: string;
  nativeName: string | null;
  lat: number;
  lng: number;
  region: string | null;
  country: string | null;
  foundedYear: number | null;
  foundedPrecision: string | null;
  status: string | null;
  schoolSlug: string | null;
  schoolName: string | null;
  schoolColor: string;
  founderSlug: string | null;
  founderName: string | null;
  /** Place's own website — preferred link surface. */
  url: string | null;
  /** Directory/source URL (SOTOZEN Europe, AZI, Wikipedia, etc.) used
   * as the popup's secondary link when a place has no website of its
   * own. Guaranteed by the seed to be populated for every temple. */
  sourceUrl: string | null;
  sourceTitle: string | null;
}

interface SchoolOption {
  slug: string;
  name: string;
  tradition: string | null;
  count: number;
}

interface TemplesPayload {
  temples: TempleFeature[];
  schools: SchoolOption[];
}

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/** Default world view — lat/lng/zoom chosen so Japan, Korea, Vietnam, India,
 * Europe, and the US east and west coasts all fall inside the initial
 * viewport on a typical 480 px tall container. */
const INITIAL_CENTER: [number, number] = [100, 25];
const INITIAL_ZOOM = 1.3;

export interface PracticeMapProps {
  /** When set, the map opens locked to this school's temples and the
   * built-in filter dropdown is hidden. Used by the URL-driven /practice
   * experience: the parent passes the current `?school=` value here. */
  initialSchool?: string;
  /** When set (any value, including "" to mean "all"), the map is fully
   * controlled by the parent — internal selection state mirrors this
   * prop on every change. Use this for URL-driven filtering. */
  selectedSchool?: string | null;
}

export default function PracticeMap({ initialSchool, selectedSchool }: PracticeMapProps = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const [data, setData] = useState<TemplesPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [schoolFilter, setSchoolFilter] = useState<string>(
    selectedSchool ?? initialSchool ?? "all"
  );

  // When the parent drives selection (URL-controlled), keep internal
  // state in sync so the existing filter useEffect re-applies.
  useEffect(() => {
    if (selectedSchool === undefined) return;
    setSchoolFilter(selectedSchool && selectedSchool.length > 0 ? selectedSchool : "all");
  }, [selectedSchool]);

  // Load /data/temples.json
  useEffect(() => {
    let cancelled = false;
    fetch("/data/temples.json")
      .then((res) => {
        if (!res.ok) throw new Error(`temples.json ${res.status}`);
        return res.json() as Promise<TemplesPayload>;
      })
      .then((payload) => {
        if (cancelled) return;
        setData(payload);
        setStatus(payload.temples.length === 0 ? "empty" : "ready");
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[PracticeMap] failed to load temples.json", err);
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize the map once data is ready.
  useEffect(() => {
    if (status !== "ready" || !data || !containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      attributionControl: { compact: true },
      pitchWithRotate: false,
      dragRotate: false,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      const features: GeoJSON.Feature<GeoJSON.Point, Record<string, unknown>>[] =
        data.temples.map((t) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [t.lng, t.lat] },
          properties: {
            slug: t.slug,
            name: t.name,
            nativeName: t.nativeName,
            region: t.region,
            country: t.country,
            foundedYear: t.foundedYear,
            foundedPrecision: t.foundedPrecision,
            schoolSlug: t.schoolSlug,
            schoolName: t.schoolName,
            schoolColor: t.schoolColor,
            founderSlug: t.founderSlug,
            founderName: t.founderName,
            url: t.url,
            sourceUrl: t.sourceUrl,
            sourceTitle: t.sourceTitle,
          },
        }));

      map.addSource("temples", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
        cluster: true,
        clusterRadius: 45,
        clusterMaxZoom: 9,
      });

      // Second, un-clustered source with the exact same features. Used
      // only when a single school is selected: clusters at world zoom
      // would otherwise hide every individual temple inside them, which
      // breaks per-school filtering for any school with >50 places.
      map.addSource("temples-flat", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });

      // Unclustered (clustered source): colored circle per temple,
      // school-matched. Only visible at high zoom, where features are
      // not clustered.
      map.addLayer({
        id: "temples-unclustered",
        type: "circle",
        source: "temples",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 6,
          "circle-color": ["get", "schoolColor"],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#faf9f7",
          "circle-opacity": 0.95,
        },
      });

      // Filtered layer (un-clustered source): hidden by default,
      // toggled on when the parent passes selectedSchool.
      map.addLayer({
        id: "temples-filtered",
        type: "circle",
        source: "temples-flat",
        layout: { visibility: "none" },
        filter: ["==", ["get", "schoolSlug"], "__none__"],
        paint: {
          "circle-radius": 6,
          "circle-color": ["get", "schoolColor"],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#faf9f7",
          "circle-opacity": 0.95,
        },
      });

      // Clusters: muted stone-colored ring with count.
      map.addLayer({
        id: "temples-clusters",
        type: "circle",
        source: "temples",
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": ["step", ["get", "point_count"], 14, 5, 18, 10, 22],
          "circle-color": "#9a8a75",
          "circle-opacity": 0.7,
          "circle-stroke-color": "#faf9f7",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "temples-cluster-count",
        type: "symbol",
        source: "temples",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#faf9f7",
        },
      });

      // Cursor feedback
      for (const layer of ["temples-unclustered", "temples-clusters", "temples-filtered"]) {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      }

      // Click a cluster: zoom in
      map.on("click", "temples-clusters", (e) => {
        const clusterFeatures = map.queryRenderedFeatures(e.point, {
          layers: ["temples-clusters"],
        }) as MapGeoJSONFeature[];
        const cluster = clusterFeatures[0];
        if (!cluster) return;
        const clusterId = cluster.properties?.cluster_id;
        if (clusterId === undefined) return;
        const source = map.getSource("temples") as GeoJSONSource | undefined;
        if (!source) return;
        source.getClusterExpansionZoom(clusterId as number).then((zoom) => {
          const coords = (cluster.geometry as GeoJSON.Point).coordinates as [number, number];
          map.easeTo({ center: coords, zoom });
        });
      });

      // Click a temple: open popup. Both unclustered layers behave the
      // same way — only one is visible at a time depending on whether a
      // school is selected.
      const onTempleClick = (e: maplibregl.MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        const feat = e.features?.[0];
        if (!feat) return;
        const p = feat.properties ?? {};
        const coords = (feat.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: "280px" })
          .setLngLat(coords)
          .setHTML(renderPopupHTML(p as Record<string, unknown>))
          .addTo(map);
      };
      map.on("click", "temples-unclustered", onTempleClick);
      map.on("click", "temples-filtered", onTempleClick);
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [status, data]);

  // React to the school filter change. When a school is selected we
  // hide the clustered source entirely and switch to the un-clustered
  // `temples-flat` source filtered to that school — otherwise points
  // hidden inside clusters at world zoom never appear.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (schoolFilter === "all") {
        map.setLayoutProperty("temples-unclustered", "visibility", "visible");
        map.setLayoutProperty("temples-clusters", "visibility", "visible");
        map.setLayoutProperty("temples-cluster-count", "visibility", "visible");
        map.setLayoutProperty("temples-filtered", "visibility", "none");
      } else {
        map.setLayoutProperty("temples-unclustered", "visibility", "none");
        map.setLayoutProperty("temples-clusters", "visibility", "none");
        map.setLayoutProperty("temples-cluster-count", "visibility", "none");
        map.setLayoutProperty("temples-filtered", "visibility", "visible");
        map.setFilter("temples-filtered", [
          "==",
          ["get", "schoolSlug"],
          schoolFilter,
        ]);

        // Fit to the bounds of the filtered school so distant points are
        // visible and the map doesn't sit on a centred-on-Asia view that
        // misses Europe / the Americas.
        const matching = data?.temples.filter((t) => t.schoolSlug === schoolFilter) ?? [];
        if (matching.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          for (const t of matching) bounds.extend([t.lng, t.lat]);
          map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 8,
            duration: 600,
          });
        }
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [schoolFilter, status, data]);

  return (
    <div className="practice-map">
      {!initialSchool && selectedSchool === undefined && (
        <div className="practice-map-controls">
          <label htmlFor="practice-map-school-filter" className="detail-eyebrow">
            Filter by school
          </label>
          <select
            id="practice-map-school-filter"
            className="masters-select"
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            disabled={!data || status !== "ready"}
          >
            <option value="all">All schools {data ? `(${data.temples.length})` : ""}</option>
            {data?.schools.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} ({s.count})
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="practice-map-wrapper" ref={containerRef} aria-label="Places of practice map" />
      {status === "loading" && <p className="detail-muted">Loading map…</p>}
      {status === "error" && (
        <p className="detail-muted">Failed to load map data. Try reloading the page.</p>
      )}
      {status === "empty" && (
        <p className="detail-muted">No geocoded temples yet.</p>
      )}
    </div>
  );
}

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Accept only http(s) — guards the popup from javascript:/data: URLs that
 * might slip through an unsanitized seed. Anything else is dropped. */
function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

function renderPopupHTML(p: Record<string, unknown>): string {
  const name = escapeHtml(p.name);
  const nativeName = p.nativeName ? escapeHtml(p.nativeName) : null;
  const region = p.region ? escapeHtml(p.region) : null;
  const country = p.country ? escapeHtml(p.country) : null;
  const location = [region, country].filter(Boolean).join(", ");
  const founded = p.foundedYear
    ? `${p.foundedPrecision === "circa" ? "c. " : ""}${p.foundedYear}`
    : null;
  const schoolSlug = p.schoolSlug ? escapeHtml(p.schoolSlug) : null;
  const schoolName = p.schoolName ? escapeHtml(p.schoolName) : null;
  const founderSlug = p.founderSlug ? escapeHtml(p.founderSlug) : null;
  const founderName = p.founderName ? escapeHtml(p.founderName) : null;

  // Prefer the place's own website; fall back to the authoritative
  // directory that lists it (SOTOZEN Europe, AZI, Wikipedia, etc.).
  const officialUrl = safeExternalUrl(p.url);
  const sourceUrl = safeExternalUrl(p.sourceUrl);
  const sourceTitle = typeof p.sourceTitle === "string" ? p.sourceTitle : null;
  let linkRow = "";
  if (officialUrl) {
    linkRow = `<p class="practice-map-popup-link"><a href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer">Official website ↗</a></p>`;
  } else if (sourceUrl) {
    // Show *which* directory we're linking to, not a generic label, so
    // practitioners know whether they're heading to Sōtōshū, AZI, etc.
    const label = sourceTitle
      ? sourceTitle.split(" — ")[0] || sourceTitle
      : "Directory listing";
    linkRow = `<p class="practice-map-popup-link"><a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a></p>`;
  }

  return `
    <div class="practice-map-popup">
      <h4>${name}</h4>
      ${nativeName ? `<p class="practice-map-popup-native" lang="ja ko zh vi">${nativeName}</p>` : ""}
      ${location ? `<p class="practice-map-popup-meta">${location}</p>` : ""}
      ${founded ? `<p class="practice-map-popup-meta">Founded ${founded}</p>` : ""}
      ${schoolSlug && schoolName
        ? `<p class="practice-map-popup-link"><a href="/schools/${schoolSlug}">${schoolName}</a></p>`
        : ""}
      ${founderSlug && founderName
        ? `<p class="practice-map-popup-link">Founder: <a href="/masters/${founderSlug}">${founderName}</a></p>`
        : ""}
      ${linkRow}
    </div>
  `;
}
