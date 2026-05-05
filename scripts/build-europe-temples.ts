/**
 * Build scripts/data/seed-temples-europe.ts from the raw research artifacts
 * under scripts/data/raw-places/zen-places-*.json.
 *
 * Pipeline:
 *   1. Load each country's raw JSON (currently France only).
 *   2. Drop entries that duplicate places already present in SEED_TEMPLES.
 *   3. Slugify names (parentheticals stripped) and dedupe within the new
 *      batch by suffixing with city.
 *   4. Geocode each entry via OpenStreetMap Nominatim — street address first,
 *      then city centroid. Results cached to scripts/data/raw-places/geocode-cache.json
 *      so re-runs are cheap.
 *   5. Map free-text lineage → schoolSlug; map source_url → sourceId.
 *   6. Emit a TempleSeed[] in scripts/data/seed-temples-europe.ts.
 *
 * Run:  npx tsx scripts/build-europe-temples.ts
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const RAW_DIR = "scripts/data/raw-places";
const CACHE_PATH = path.join(RAW_DIR, "geocode-cache.json");
const OUT_PATH = "scripts/data/seed-temples-europe.ts";

// Discover every per-country research file. Agents add new countries by
// writing zen-places-<cc>.json into RAW_DIR; this script picks them up.
const RAW_PATHS = readdirSync(RAW_DIR)
  .filter((f) => /^zen-places-[a-z][a-z0-9-]+\.json$/i.test(f))
  .sort()
  .map((f) => path.join(RAW_DIR, f));

const NOMINATIM_USER_AGENT =
  "zenlineage.org-research/1.0 (https://zenlineage.org)";

interface RawPlace {
  name: string;
  city: string;
  region: string;
  lineage: string;
  address: string | null;
  url: string;
  source_url: string;
  notes?: string;
}

interface RawFile {
  _meta?: { country?: string; [k: string]: unknown };
  places: RawPlace[];
}

// All slugs already curated by hand in scripts/data/seed-temples.ts (i.e.
// the entries that appear BEFORE the `...EUROPE_TEMPLE_SEEDS` spread).
// We preload them so a new agent batch never overwrites a curated row's
// foundedYear / founderSlug / sourceExcerpt with thinner generated data.
function loadCuratedSlugs(): Set<string> {
  const src = readFileSync("scripts/data/seed-temples.ts", "utf-8");
  const cutoff = src.indexOf("...EUROPE_TEMPLE_SEEDS");
  const head = cutoff >= 0 ? src.slice(0, cutoff) : src;
  const slugs = new Set<string>();
  for (const m of head.matchAll(/slug:\s*"([^"]+)"/g)) slugs.add(m[1]);
  return slugs;
}

// Patterns that mean an agent-provided entry is the same place we already
// have hardcoded in seed-temples.ts. When a pattern matches, we drop the
// entry so we don't fight the canonical row.
const DUP_PATTERNS: { pattern: RegExp; existingSlug: string }[] = [
  { pattern: /gendronni[èe]re/i, existingSlug: "la-gendronniere" },
  { pattern: /ryumonji/i, existingSlug: "ryumonji-alsace" },
  { pattern: /kanshoji/i, existingSlug: "kanshoji" },
  { pattern: /falaise\s*verte/i, existingSlug: "falaise-verte" },
  {
    pattern: /(plum\s*village|village\s*des\s*pruniers)/i,
    existingSlug: "plum-village-*",
  },
  {
    pattern: /source\s*gu[ée]rissante|healing\s*spring/i,
    existingSlug: "healing-spring-monastery",
  },
  {
    pattern: /maison\s*de\s*l['']?\s*inspir/i,
    existingSlug: "maison-de-linspir",
  },
];

function isDuplicate(name: string): string | null {
  for (const { pattern, existingSlug } of DUP_PATTERNS) {
    if (pattern.test(name)) return existingSlug;
  }
  return null;
}

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function slugify(s: string): string {
  const result = stripDiacritics(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-+/g, "-");
  // CJK / other non-Latin names slugify to "" — fall back to a placeholder
  // so the per-batch deduper can still suffix it with the city.
  return result || "temple";
}

function nameForSlug(fullName: string): string {
  const before = fullName.split(/\s*\(/)[0].trim();
  return before.length >= 4 ? before : fullName;
}

// Lineage free-text → school slug (must match a row in `schools`).
function lineageToSchoolSlug(lineage: string): string {
  const l = lineage.toLowerCase();
  // Korean orders — check specific orders before the generic "seon" fallback.
  if (l.includes("kwan um")) return "kwan-um";
  if (l.includes("jogye") || l.includes("chogye")) return "jogye";
  if (l.includes("taego")) return "taego-order";
  if (l.includes("cheontae") || l.includes("tiantai")) return "other";
  if (l.includes("seon")) return "jogye"; // generic Korean Seon → default to Jogye (largest order)
  // Vietnamese Thiền — check specific schools before generic Plum Village fallback.
  if (l.includes("trúc lâm") || l.includes("truc lam")) return "truc-lam";
  if (l.includes("lâm tế") || l.includes("lam te")) return "lam-te";
  if (
    l.includes("plum village") ||
    l.includes("thich nhat hanh") ||
    l.includes("làng mai") ||
    l.includes("lang mai")
  )
    return "plum-village";
  // Generic Vietnamese Thiền with no subschool marker — bucket as "other"
  // rather than blindly assigning Plum Village.
  if (l.includes("thiền") || l.includes("thien")) return "other";
  if (l.includes("sanbō zen") || l.includes("sanbo zen")) return "sanbo-zen";
  if (l.includes("rinzai")) return "rinzai";
  if (l.includes("ōbaku") || l.includes("obaku")) return "obaku";
  if (l.includes("chan") || l.includes("ch'an")) return "chan";
  // Sōtō covers AZI/Deshimaru, Kosen Sangha, Kanshoji, Sotoshu, Dogen Sangha,
  // Moriyama/Aoyama, Nishijima, etc.
  return "soto";
}

// Source URL host → registered sourceId.
function pickSourceId(sourceUrl: string, lineage: string): string {
  const u = sourceUrl.toLowerCase();

  // ── North-American sect umbrellas ───────────────────────────────────
  if (u.includes("szba.org")) return "src_szba";
  if (u.includes("sfzc.org")) return "src_sfzc";
  if (u.includes("zmm.org") || u.includes("mountainsandrivers"))
    return "src_mountains_rivers";
  if (u.includes("diamondsangha.org")) return "src_diamond_sangha";
  if (u.includes("rinzaiji.org")) return "src_rinzaiji";

  // ── Pan-European / sect networks ────────────────────────────────────
  if (u.includes("zen-deshimaru.com")) return "src_kosen_sangha";
  if (u.includes("kanshoji.org")) return "src_kanshoji";
  if (u.includes("zen-road.org")) return "src_zen_road";
  if (u.includes("abzen.eu")) return "src_abze";
  if (u.includes("sotozen.com") || u.includes("sotozen-net"))
    return "src_sotozen_europe";
  if (u.includes("zen-azi.org")) return "src_azi";
  if (u.includes("sanbo-zen")) return "src_sanbozen";
  if (u.includes("onedropzen")) return "src_onedropzen";
  if (u.includes("whiteplum.org")) return "src_whiteplum";

  // ── Plum Village national directories all credit Plum Village ───────
  if (
    u.includes("plumvillage.org") ||
    u.includes("plumvillage.uk") ||
    u.includes("aandacht.net") ||
    u.includes("intersein.de") ||
    u.includes("tnhspain.com") ||
    u.includes("interessere.it") ||
    u.includes("interbeing.dk") ||
    u.includes("mindfulnessireland.ie") ||
    u.includes("plumvillage-traditionen.se")
  )
    return "src_plumvillage_monastic";

  // ── Kwan Um national branches all credit Kwan Um ────────────────────
  if (u.includes("kwanum") || u.includes("kvanumzen") || u.includes("zen.pl/"))
    return "src_kwanum";

  // ── Country-specific Zen guides + monasteries ───────────────────────
  if (u.includes("zen-guide.de")) return "src_zen_guide_de";
  if (u.includes("felsentor.ch")) return "src_felsentor";
  if (u.includes("puregg.org")) return "src_puregg";
  if (u.includes("luzserena.org")) return "src_luz_serena";
  if (u.includes("sotozen.es")) return "src_sotozen_es";

  // ── UK networks ─────────────────────────────────────────────────────
  if (u.includes("obcon.org") || u.includes("throsselhole")) return "src_obc";
  if (u.includes("westernchanfellowship") || u.includes("w-c-f.org"))
    return "src_western_chan_fellowship";
  if (u.includes("stonewaterzen.org")) return "src_stonewater_zen";
  if (u.includes("izauk.org")) return "src_izauk";
  if (u.includes("thebuddhistsociety")) return "src_buddhist_society_uk";

  // ── National Buddhist umbrella directories ──────────────────────────
  if (u.includes("buddhismus-deutschland.de")) return "src_dbu";
  if (u.includes("boeddhisme.nl")) return "src_bun";
  if (u.includes("sbu.net")) return "src_sbu";
  if (u.includes("buddhismus-austria") || u.includes("buddhistisch.at"))
    return "src_obr";
  if (u.includes("unionebuddhistaitaliana") || u.includes("buddhismo.it"))
    return "src_ubi";
  if (u.includes("uniaobudista.pt")) return "src_ubp";
  if (u.includes("bouddhisme-france.org")) return "src_bouddhisme_france";

  if (u.includes("en.wikipedia.org")) return "src_wikipedia";

  // ── Lineage-based fallbacks ─────────────────────────────────────────
  const l = lineage.toLowerCase();
  if (l.includes("kanshoji")) return "src_kanshoji";
  if (l.includes("kosen sangha")) return "src_kosen_sangha";
  if (l.includes("plum village") || l.includes("thiền") || l.includes("thien"))
    return "src_plumvillage_monastic";
  if (l.includes("kwan um") || l.includes("seon")) return "src_kwanum";
  if (l.includes("sanbō zen") || l.includes("sanbo zen")) return "src_sanbozen";
  if (l.includes("white plum") || l.includes("peacemaker"))
    return "src_whiteplum";
  if (l.includes("(azi)") || l.includes("deshimaru")) return "src_azi";

  // Generic catch-all — preserves provenance via the sourceExcerpt host.
  return "src_eu_zen_research";
}

// Manual coordinate overrides for places where Nominatim fails (rural retreats,
// PO-box addresses, networks without a single physical location, etc.).
// Keyed by the raw `name` field. Values are [lat, lng].
const MANUAL_COORDS: Record<string, [number, number]> = {
  "Jikishoan Zen Buddhist Community": [-37.7434, 144.9988], // Preston VIC 3072
  "Melbourne Zen Group": [-37.7589, 144.9876], // CERES Environment Park, Brunswick East
  "Centrum Oko Lesa (Sandō Kaisen — retreat)": [49.8175, 15.473], // Czech centroid (rural retreat, exact loc not public)
  "Europäisches Zentrum für Meditation und Begegnung Neumühle": [49.4756, 6.5697], // Mettlach-Tünsdorf 66693
  "Sangha Aman à Breman (Plougiel)": [48.7833, -3.2667], // Plougiel, Côtes-d'Armor
  "Shawbottom Farm Retreat": [52.45, -2.75], // Shropshire approx (WCF retreat venue)
  "Asian Institute of Applied Buddhism (AIAB) – Lotus Pond Temple": [22.2553, 113.905], // Ngong Ping, Lantau
  "Dharma Drum Mountain Hong Kong Centre": [22.3373, 114.1467], // Lai Chi Kok, Kowloon
  "Pu Guang Meditation Center (Chung Tai HK)": [22.278, 114.1747], // Wanchai
  "Chan Retreat Center Hartovski Vrh (Dharmaloka)": [45.7833, 15.3667], // Žumberak Nature Park
  "Bodhi Zendo": [10.241, 77.504], // Perumalmalai, near Kodaikanal
  "Dharma Drum Mountain Malaysia Centre": [3.175, 101.565], // Kwasa Damansara
  "Zen Peacemakers Lage Landen (ZPLL)": [52.1326, 5.2913], // NL centroid (NL/BE network)
  "Grupa Zen Kwan Um Płock": [52.5468, 19.7064], // Płock
  "Almond Blossom Sangha (Sangha Flor de Amêndoeira)": [37.0194, -7.9304], // Faro, Algarve
  Zengården: [59.45, 15.65], // Finnåker near Arboga
};

type Cache = Record<string, [number, number] | null>;

function loadCache(): Cache {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8")) as Cache;
  } catch {
    return {};
  }
}

function saveCache(cache: Cache): void {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function geocodeOne(
  query: string,
  cache: Cache,
  countryCode: string
): Promise<[number, number] | null> {
  const cacheKey = `${countryCode}:${query}`;
  if (cacheKey in cache) return cache[cacheKey];
  // Nominatim's countrycodes filter only accepts ISO 3166-1 alpha-2.
  // Filenames like `zen-places-us-pv.json` produce a non-conforming cc;
  // in that case omit the filter and let the query string carry the
  // country (queries always include ", <Country Name>").
  const filterCC = /^[a-z]{2}$/i.test(countryCode) ? countryCode : "";
  const filter = filterCC ? `&countrycodes=${filterCC}` : "";
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1${filter}`;
  let result: [number, number] | null = null;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": NOMINATIM_USER_AGENT },
    });
    if (res.ok) {
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data.length > 0) {
        result = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    }
  } catch (err) {
    console.warn(`  geocode error for "${query}":`, err);
  }
  cache[cacheKey] = result;
  saveCache(cache);
  await sleep(1100); // Nominatim usage policy: max 1 req/sec
  return result;
}

function buildQueries(p: RawPlace, country: string): string[] {
  const queries: string[] = [];
  // Drop region parentheticals for cleaner queries.
  const cleanRegion = p.region.replace(/\s*\([^)]+\)/g, "").trim();
  if (p.address && p.address.length > 5) {
    queries.push(`${p.address}, ${country}`);
  }
  if (cleanRegion) queries.push(`${p.city}, ${cleanRegion}, ${country}`);
  queries.push(`${p.city}, ${country}`);
  return [...new Set(queries)];
}

function buildExcerpt(p: RawPlace): string {
  const host = (() => {
    try {
      return new URL(p.source_url).hostname;
    } catch {
      return p.source_url;
    }
  })();
  const noteFragment = p.notes ? ` ${p.notes}` : "";
  return `${p.name} — listed at ${host} (${p.lineage}).${noteFragment}`.trim();
}

async function main(): Promise<void> {
  const cache = loadCache();
  const curatedSlugs = loadCuratedSlugs();
  const seenSlugs = new Set<string>();
  const lines: string[] = [];
  let kept = 0;
  let skippedDup = 0;
  let skippedCurated = 0;
  let skippedNoCoords = 0;
  const failed: string[] = [];

  console.log(`Loaded ${curatedSlugs.size} curated slugs to protect.`);

  for (const filePath of RAW_PATHS) {
    const raw = JSON.parse(readFileSync(filePath, "utf-8")) as RawFile;
    const cc = path
      .basename(filePath)
      .replace(/^zen-places-/, "")
      .replace(/\.json$/, "")
      .toLowerCase();
    const country = raw._meta?.country ?? cc.toUpperCase();
    console.log(
      `\n=== ${filePath} → country=${country} cc=${cc} (${raw.places.length} places) ===`
    );
    for (const p of raw.places) {
      const dup = isDuplicate(p.name);
      if (dup) {
        skippedDup++;
        console.log(`  skip (dup of ${dup}): ${p.name}`);
        continue;
      }

      // Slug — parenthetical-stripped name, deduped within batch.
      const baseSlug = slugify(nameForSlug(p.name));
      let slug = baseSlug;
      if (curatedSlugs.has(slug)) {
        skippedCurated++;
        console.log(`  skip (curated row exists): ${slug}`);
        continue;
      }
      if (seenSlugs.has(slug)) {
        slug = `${baseSlug}-${slugify(p.city)}`;
        let n = 2;
        while (seenSlugs.has(slug) || curatedSlugs.has(slug))
          slug = `${baseSlug}-${slugify(p.city)}-${n++}`;
      }
      seenSlugs.add(slug);

      // Geocode — manual override first, then Nominatim queries.
      let coords: [number, number] | null = MANUAL_COORDS[p.name] ?? null;
      if (!coords) {
        for (const q of buildQueries(p, country)) {
          coords = await geocodeOne(q, cache, cc);
          if (coords) break;
        }
      }
      if (!coords) {
        skippedNoCoords++;
        failed.push(`${cc}: ${p.name}`);
        console.log(`  ✗ no coords: ${p.name}`);
        continue;
      }

      const schoolSlug = lineageToSchoolSlug(p.lineage);
      const sourceId = pickSourceId(p.source_url, p.lineage);
      const excerpt = buildExcerpt(p);

      lines.push(
        `  {
    slug: ${JSON.stringify(slug)},
    names: [{ locale: "en", value: ${JSON.stringify(p.name)} }],
    lat: ${coords[0]},
    lng: ${coords[1]},
    region: ${JSON.stringify(p.region)},
    country: ${JSON.stringify(country)},
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: ${JSON.stringify(schoolSlug)},
    status: "active",
    sourceId: ${JSON.stringify(sourceId)},
    sourceExcerpt: ${JSON.stringify(excerpt)},
    url: ${JSON.stringify(p.url)},
  },`
      );
      kept++;
      console.log(`  ✓ ${slug} [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`);
    }
  }

  const file = `/**
 * Europe temple seeds — GENERATED by scripts/build-europe-temples.ts.
 * Source: scripts/data/raw/zen-places-*.json. Do not hand-edit; re-run
 * the builder after editing the raw JSON or the lineage→slug mapping.
 *
 * Coordinates: OpenStreetMap Nominatim — street address when supplied
 * by the source listing, falling back to commune centroid. Multiple
 * dojos in the same commune may share a pin until we have street
 * addresses. Cache: scripts/data/raw/geocode-cache.json.
 */

import type { TempleSeed } from "./seed-temples";

export const EUROPE_TEMPLE_SEEDS: TempleSeed[] = [
${lines.join("\n")}
];
`;
  writeFileSync(OUT_PATH, file);

  console.log(`\n=== Summary ===`);
  console.log(`  written:            ${kept} → ${OUT_PATH}`);
  console.log(`  skipped (curated):  ${skippedCurated}`);
  console.log(`  skipped (pattern):  ${skippedDup}`);
  console.log(`  skipped (geocode):  ${skippedNoCoords}`);
  if (failed.length) {
    console.log(`  failures:`);
    for (const n of failed) console.log(`    - ${n}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
