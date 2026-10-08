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
import { sourcedPracticeDetails, type PracticeDetails } from "../src/lib/practice-details";

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
  /** Preferred visitor link. Some raw entries use a third-party directory;
   * null means the source listing is the only available link. */
  url: string | null;
  source_url: string;
  notes?: string;
  practiceDetails?: PracticeDetails;
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
//
// `existingSlug` names the row that survives — normally a curated one, but
// occasionally a generated sibling, when two directory listings describe one
// place and neither has a hand-written counterpart. It is only reported in
// the skip log, so it does not have to resolve to a curated row; what it has
// to do is tell the next reader where the dropped entry went.
const DUP_PATTERNS: { pattern: RegExp; existingSlug: string }[] = [
  { pattern: /gendronni[èe]re/i, existingSlug: "la-gendronniere" },
  { pattern: /ryumonji/i, existingSlug: "ryumonji-alsace" },
  { pattern: /kanshoji/i, existingSlug: "kanshoji" },
  { pattern: /falaise\s*verte/i, existingSlug: "falaise-verte" },
  // Matches only the French Plum Village monastery itself (Thénac/Loubès-Bernac
  // hamlets), NOT regional national chapters like "Plum Village Indonesia" or
  // "Thai Plum Village". The latter are distinct sanghas worth pinning.
  {
    pattern: /^(plum\s*village(\s+(monastery|france))?|village\s*des\s*pruniers)$/i,
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
  // Curated rows (in seed-temples.ts) that agents tried to re-import under
  // slightly different slugs. Pattern matches the agent's full name so the
  // duplicate is dropped before slugification.
  { pattern: /throssel\s*hole/i, existingSlug: "throssel-hole-abbey" },
  { pattern: /shobo-?an.*(hampstead|zen\s*centre)|the\s*zen\s*centre.*shobo/i, existingSlug: "shobo-an-london" },
  { pattern: /shobo-?an\s*luton/i, existingSlug: "shobo-an-luton" },
  { pattern: /chogye\s*international/i, existingSlug: "chogye-international-nyc" },
  { pattern: /zen\s*center\s*of\s*las\s*vegas/i, existingSlug: "zen-center-las-vegas" },
  { pattern: /^dharma\s*zen\s*center$/i, existingSlug: "dharma-zen-center-la" },
  { pattern: /jikishoan/i, existingSlug: "jikishoan-melbourne" },
  { pattern: /^zen\s*open\s*circle$/i, existingSlug: "zen-open-circle-sydney" },
  { pattern: /lions\s*gate\s*buddhist\s*priory/i, existingSlug: "lions-gate-priory" },
  { pattern: /^templo\s*(zen\s*)?sh[ōo]b[ōo]genji$/i, existingSlug: "templo-shobogenji-cordoba" },
  { pattern: /^jogye-?\s*sa$/i, existingSlug: "jogye-sa-seoul" },
  // Match either the diacriticked Vietnamese form ("Thiền viện Trúc Lâm Đà Lạt")
  // or the ASCII form (after stripDiacritics) — isDuplicate tests both.
  {
    pattern: /thien\s*vien\s*truc\s*lam\s*da\s*lat/i,
    existingSlug: "truc-lam-dalat",
  },
  {
    pattern: /thien\s*vien\s*truc\s*lam\s*phung\s*hoang/i,
    existingSlug: "truc-lam-dalat",
  },
  // Curated row tu-dam-pagoda already covers this Huế temple under both
  // "Từ Đàm Pagoda" (en) and "Chùa Từ Đàm" (vi).
  {
    pattern: /(chua\s*tu\s*dam|tu\s*dam\s*pagoda)/i,
    existingSlug: "tu-dam-pagoda",
  },
  // "Tổ đình Từ Hiếu" is the curated tu-hieu-temple — Thích Nhất Hạnh's
  // root temple in Huế, where he ordained in 1942 and later returned. It
  // was seeded twice: once curated, once from the Làng Mai listing, with
  // the second copy stranded on the Huế city centroid ~4km away.
  // Anchored on the "tổ đình" (root temple) prefix or a Huế qualifier: the
  // Plum Village lineage has Từ Hiếu-named branch temples abroad, and a bare
  // /tu\s*hieu/ would silently discard the first one anybody adds.
  {
    pattern: /(to\s*dinh\s*tu\s*hieu|tu\s*hieu.*hue|hue.*tu\s*hieu)/i,
    existingSlug: "tu-hieu-temple",
  },
  // Chùa Vĩnh Nghiêm at 339 Nam Kỳ Khởi Nghĩa, District 3, HCMC is the
  // curated vinh-nghiem-pagoda. The duplicate also disagreed on school
  // (truc-lam vs lam-te) and sat ~9km away on a centroid. Anchored to the
  // Sài Gòn parenthetical so the distinct Bắc Giang temple of the same
  // name — the medieval Trúc Lâm seat — is still imported.
  {
    pattern: /chua\s*vinh\s*nghiem\s*\(\s*sai\s*gon\s*\)/i,
    existingSlug: "vinh-nghiem-pagoda",
  },
  // 南華寺 on Mount Caoxi — Huineng's monastery, and the one place this
  // atlas can least afford to double-count. It was seeded twice under two
  // schools (early-chan vs chan) and two coordinates, both wrong; once
  // each was corrected to the Wikipedia infobox they landed on the same
  // point, which is what confirmed them as one temple.
  {
    pattern: /nanhua\s*(chan\s*)?temple|nanhua\s*si/i,
    existingSlug: "nanhua-temple",
  },
  // Busshinji, Rua São Joaquim 285 in Liberdade — the Sōtōshū's South
  // America head temple, seeded once curated and once from the sect
  // listing under its full institutional name. Anchored on "América do
  // Sul" so the separate Dōkōzan Busshinji at Rolândia, Paraná survives.
  {
    pattern: /busshinji.*am[ée]rica\s*do\s*sul|am[ée]rica\s*do\s*sul.*busshinji/i,
    existingSlug: "templo-busshinji-sao-paulo",
  },
  // Mosteiro Zen Morro da Vargem at Ibiraçu, ES — seeded twice, and both
  // copies were ~5km off the monastery in different directions. The
  // curated row now carries the OSM node.
  {
    pattern: /morro\s*da\s*vargem/i,
    existingSlug: "mosteiro-zen-morro-da-vargem",
  },
  // Three more places seeded both by hand and again from a directory
  // listing, under a slightly longer name each time. Found by sweeping
  // for same-country pairs under 2km apart whose names share most of
  // their distinctive words.
  // Anchored on Berkeley: the Kwan Um network also runs Empty Gate
  // centres in Santa Clara and Boise, which are separate sanghas.
  {
    pattern: /empty\s*gate\s*zen\s*center\s*[-–—]?\s*berkeley/i,
    existingSlug: "empty-gate-berkeley",
  },
  {
    pattern: /boundless\s*way\s*zen\s*temple/i,
    existingSlug: "boundless-way-zen-temple",
  },
  { pattern: /sanb[oō]\s*zend[oō]\s*weyarn/i, existingSlug: "domicilium-weyarn" },

  // ── 2026-08-16 duplicate sweep ──────────────────────────────────────
  // Ten more places seeded twice: once curated, once from a sect or
  // network directory under a longer or more formal name. Each pair was
  // checked against the place's own contact page and a second source, and
  // each resolved to a single postal address. Found by
  // scripts/check-temple-duplicates.ts — run it after adding places.
  //
  // Reported by a reader: Seikyūji sits in an olive grove off the
  // Marchena–Morón road, but the curated row had it in the middle of
  // Seville, 57km away, alongside this second copy. Only one "Seikyuji"
  // exists; the affiliated Andalusian dōjōs are named for their own towns.
  { pattern: /seikyuji/i, existingSlug: "seikyuji-moron" },
  // "Istituto Italiano Zen Sōtō Shōbōzan Fudenji" is the institute's
  // registered name; "Fudenji" is the monastery it names. One address at
  // Strada Comunale Bargone 113, Salsomaggiore Terme.
  { pattern: /fudenji/i, existingSlug: "fudenji" },
  // Anchored on the Waldbröl institute itself. EIAB runs no second campus.
  {
    pattern: /european\s*institute\s*of\s*applied\s*buddhism|\beiab\b/i,
    existingSlug: "eiab-germany",
  },
  { pattern: /benediktushof/i, existingSlug: "benediktushof" },
  { pattern: /keiry[uū]ji/i, existingSlug: "keiryuji-camprodon" },
  // The monastery's own masthead reads "Tahoma Zen Monastery — Tahoma-san
  // Sogen-ji", both names for 6499 Wahl Rd, Freeland WA.
  {
    pattern: /tahoma[\s-]*(san)?[\s-]*(sogen-?ji|one\s*drop|zen\s*monastery)/i,
    existingSlug: "tahomasan-sogenji",
  },
  { pattern: /abhirati/i, existingSlug: "centro-zen-abhirati" },
  // Both halves of the name are required. monasterozen.it also hosts
  // Sanboji, Tempio Zen Sokuzen, Tempio Unsui and Centro Zen Milano L20;
  // a bare /il cerchio/ additionally swallows Enkuji – Il Cerchio Vuoto,
  // and a bare /ens[oō]ji/ swallows anything ending in -sōji (Sensōji).
  {
    pattern: /ens[oō]-?\s*ji\s*[-–—]?\s*il\s*cerchio/i,
    existingSlug: "ensoji-il-cerchio",
  },
  // Anchored on Liverpool: StoneWater also runs South London and Kent
  // groups, and two rural retreat centres, all distinct.
  { pattern: /stonewater\s*zen\s*liverpool/i, existingSlug: "stonewater-zen" },
  // Anchored on Copenhagen: the Danish network's Odense zendo is separate.
  {
    pattern: /one\s*drop\s*zend[oō]\s*(k[oø]benhavn|copenhagen)/i,
    existingSlug: "onedropzen-copenhagen",
  },
  // Two Rivers Zen Community was listed under both of its homes at once.
  // The group's own site says it "practiced at Bendowa Temple in
  // Narrowsburg, N.Y." before moving online, and its Honesdale venue —
  // Court Street Zendo — is the earlier address it left, still carried by
  // a stale directory. One community, one (now dormant) temple; the "(PA)"
  // listing is the superseded one.
  {
    pattern: /two\s*rivers\s*zen\s*community\s*\(\s*pa\s*\)/i,
    existingSlug: "two-rivers-zen-community",
  },
];

function isDuplicate(name: string): string | null {
  // Match against both the raw name and a diacritic-stripped lowercase form
  // so simple ASCII patterns also catch Vietnamese / Korean / Japanese names
  // (e.g. "Thiền viện Trúc Lâm Đà Lạt" decomposes to "thien vien truc lam da lat").
  const ascii = stripDiacritics(name).toLowerCase();
  for (const { pattern, existingSlug } of DUP_PATTERNS) {
    if (pattern.test(name) || pattern.test(ascii)) return existingSlug;
  }
  return null;
}

/**
 * Places a research pass collected that do not belong on this map.
 *
 * This atlas charts Chan / Seon / Thiền / Zen places of practice. A temple
 * of another tradition is not a lesser thing — it simply is not what this
 * map is about, and filing it under a Zen school puts a lineage claim on a
 * community that never made one. Removing it respects both traditions more
 * than an incorrect label would.
 *
 * Keyed by the raw `name`; the reason is required so nothing is ever
 * dropped silently or without an argument attached.
 */
const NOT_A_ZEN_PLACE: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /phước\s*hải|phuoc\s*hai|ngọc\s*hoàng|ngoc\s*hoang|jade\s*emperor/i,
    reason:
      "Chùa Ngọc Hoàng / Phước Hải Tự, 73 Mai Thị Lựu, HCMC — the Jade Emperor Pagoda. " +
      "Founded 1909 by the Cantonese merchant Liu Daoyuan and dedicated to the Jade " +
      "Emperor; Wikipedia, the listing's own source, describes it as a Taoist, Buddhist " +
      "and Confucian temple. It is a syncretic Taoist foundation, not a Thiền practice " +
      "centre, and the raw entry's 'Lâm Tế-affiliated' note is unsupported.",
  },
];

function notAZenPlace(name: string): string | null {
  const ascii = stripDiacritics(name).toLowerCase();
  for (const { pattern, reason } of NOT_A_ZEN_PLACE) {
    if (pattern.test(name) || pattern.test(ascii)) return reason;
  }
  return null;
}

function stripDiacritics(s: string): string {
  // Vietnamese đ/Đ are precomposed (U+0111 / U+0110) and survive NFD —
  // map them to d/D explicitly so dup patterns like /chua\s*tu\s*dam/i
  // still catch agent-supplied "Chùa Từ Đàm".
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
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

// Preserve existing public slugs when an official directory supplies a
// corrected display name. London is already a curated seed row.
const STABLE_PLACE_SLUGS: Record<string, string> = {
  "Dojo zen de Girona": "azc-azi-dojo-zen-de-girona",
  "Centre zen de Barcelona": "centro-zen-barcelona",
  "Centre Zen Nalanda": "nalanda-dojo-zen",
  "London Fo Guang Shan Temple": "ibps-london",
};

// Two-letter Australian state codes used inconsistently by some agents.
const AU_STATE_NAMES: Record<string, string> = {
  ACT: "Australian Capital Territory",
  NSW: "New South Wales",
  NT: "Northern Territory",
  QLD: "Queensland",
  SA: "South Australia",
  TAS: "Tasmania",
  VIC: "Victoria",
  WA: "Western Australia",
};

// Many agents emitted region as "City, State" or "Town, Region" — collapse
// to just the broader administrative unit (last comma segment) so region
// grouping in the UI stays consistent. Also expand AU state abbreviations.
function normalizeRegion(region: string, country: string): string {
  let r = region.trim();
  if (r.includes(",")) r = r.split(",").pop()!.trim();
  if (country === "Australia" && AU_STATE_NAMES[r]) r = AU_STATE_NAMES[r];
  return r;
}

// Lineage strings drift heavily for the most common schools — same school
// shows up under 5+ surface labels. Canonicalize the high-volume clusters
// so the rendered lineage chip is consistent. Lineages that genuinely
// encode a sub-network (Sōtō / Deshimaru AZI vs. Sōtō / Kanshoji) are
// left alone — that information is meaningful.
function canonicalizeLineage(rawLineage: string, school: string): string {
  const l = rawLineage.toLowerCase();
  if (school === "plum-village") {
    return "Plum Village (Thích Nhất Hạnh)";
  }
  if (school === "kwan-um") {
    return "Kwan Um School of Zen (Korean Seon)";
  }
  if (school === "white-plum-asanga") {
    if (/de waele|zen sangha/.test(l))
      return "Sōtō / White Plum Asanga (Frank De Waele Roshi)";
    if (/peacemaker/.test(l)) return "Zen Peacemakers (Bernie Glassman)";
    return "White Plum Asanga (Maezumi lineage)";
  }
  if (school === "jogye" && !/jogye/i.test(rawLineage)) {
    // Generic "Korean Seon" → tag the dominant order explicitly.
    return "Korean Seon (Jogye Order)";
  }
  return rawLineage;
}

// Lineage free-text → school slug (must match a row in `schools`).
/**
 * Free-text lineage → school slug.
 *
 * Two rules govern this map, both learned the hard way:
 *
 * 1. **Never assert an affiliation the listing does not evidence.** The
 *    fallback is `"other"`, not `"soto"`. A sangha that describes itself as
 *    "Zen (lineage not specified)" is not Sōtō, and filing it under Sōtō
 *    puts a made-up institutional claim on someone else's practice. Sōtō is
 *    returned only when a Sōtō marker is actually present.
 *
 * 2. **Order is load-bearing, because names collide.** "Harada" is two
 *    different lineages: Harada Daiun Sōgaku founded the Harada–Yasutani
 *    stream, while Shōdō Harada Rōshi teaches Rinzai at Sōgen-ji. Matching
 *    bare "harada" files a dozen One Drop Rinzai dōjō under Sanbō Zen. Match
 *    "yasutani" instead, and let the specific networks win before the
 *    tradition-level fallbacks.
 */
function lineageToSchoolSlug(lineage: string): string {
  const l = lineage.toLowerCase();
  // Korean orders — check specific orders before the generic "seon" fallback.
  if (l.includes("kwan um")) return "kwan-um";
  if (l.includes("jogye") || l.includes("chogye")) return "jogye";
  if (l.includes("taego")) return "taego-order";
  if (l.includes("cheontae") || l.includes("tiantai")) return "other";
  // Independent Korean orders and teachers who are emphatically not Jogye:
  // Samu Sunim's Buddhist Society for Compassionate Wisdom, and the Yun Hwa
  // order of Ji Kwang Dae Poep Sa Nim. Naming either as Jogye asserts a
  // membership that does not exist.
  if (
    l.includes("samu sunim") ||
    l.includes("compassionate wisdom") ||
    l.includes("yun hwa") ||
    l.includes("world social buddhism")
  )
    return "seon";
  // Generic Korean Seon with no order named → the tradition bucket, which is
  // true of every Korean Seon group, rather than the largest order, which is
  // a guess about who they belong to.
  if (l.includes("seon") || l.includes("sŏn") || l.includes("son buddhism"))
    return "seon";
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

  // Rinzai networks that carry a colliding name. These MUST resolve before
  // the Harada–Yasutani rule below, or the wrong pattern claims them.
  //   · Shōdō Harada Rōshi of Sōgen-ji and the One Drop sangha — "harada"
  //     here is not Harada Daiun Sōgaku of the Harada–Yasutani stream.
  //   · Daishin Zen — Hinnerk Polenski's order, an independent Rinzai line
  //     founded in 1998 with Reiko Mukai Rōshi, who holds Dharma succession
  //     from Oi Saidan Rōshi of Hōkō-ji. Not to be confused with Willigis
  //     Jäger's Sanbō-Kyōdan-derived German network, which goes by Leere
  //     Wolke / West-östliche Weisheit and is matched further down.
  if (
    l.includes("one drop") ||
    l.includes("sogenji") ||
    l.includes("sōgen-ji") ||
    l.includes("shodo harada") ||
    l.includes("shōdō harada") ||
    l.includes("daishin zen") ||
    l.includes("polenski") ||
    /\bmukai\b/.test(l)
  )
    return "rinzai";

  // White Plum / Maezumi descendants and Bernie Glassman's Zen Peacemakers.
  // MUST come before the Sanbō and Sōtō rules: White Plum entries tag
  // themselves "Sōtō / White Plum (Maezumi)" or "Sōtō / Harada-Yasutani /
  // Tetsugen Serra", and either fallback would swallow them.
  //   · Mountains and Rivers Order — Daido Loori, a Maezumi Dharma heir.
  //   · Ordinary Mind Zen School — Joko Beck, a Maezumi Dharma heir.
  //   · Tetsugen Serra — Dharma heir of Tetsugen Bernie Glassman.
  if (
    l.includes("white plum") ||
    l.includes("maezumi") ||
    l.includes("peacemaker") ||
    l.includes("mountains and rivers") ||
    l.includes("mountains & rivers") ||
    l.includes("loori") ||
    l.includes("ordinary mind") ||
    l.includes("joko beck") ||
    l.includes("tetsugen serra")
  )
    return "white-plum-asanga";

  // The Harada–Yasutani stream: Sanbō Kyōdan and everything that grew out of
  // it. These are lay-ordination koan lineages descending from Harada Daiun
  // Sōgaku through Yasutani Haku'un — not Sōtō parish Zen, which is where
  // they all landed before this rule existed.
  //   · Diamond Sangha — Robert Aitken.
  //   · Cloud-Water Sangha / Rochester — Philip Kapleau, Bodhin Kjolhede.
  //   · Leere Wolke — Willigis Jäger, authorised by Yamada Kōun. (His German
  //     network, distinct from Polenski's Rinzai "Daishin Zen" above.)
  //   · Zendo Betania / Enomiya-Lassalle — the Christian-Zen line.
  //   · Pacific Zen Institute — John Tarrant, Aitken's first heir.
  //   · Bodhi Sangha — Ama Samy, ex-Sanbō Kyōdan.
  if (
    l.includes("sanbō") ||
    l.includes("sanbo") ||
    l.includes("yasutani") ||
    l.includes("diamond sangha") ||
    l.includes("kapleau") ||
    l.includes("kjolhede") ||
    l.includes("cloud-water") ||
    l.includes("rochester") ||
    l.includes("willigis") ||
    l.includes("jäger") ||
    l.includes("leere wolke") ||
    l.includes("lassalle") ||
    l.includes("betania") ||
    l.includes("pacific zen") ||
    l.includes("tarrant") ||
    l.includes("ama samy")
  )
    return "sanbo-zen";

  if (l.includes("rinzai")) return "rinzai";
  if (l.includes("ōbaku") || l.includes("obaku")) return "obaku";
  if (l.includes("chan") || l.includes("ch'an")) return "chan";

  // Sōtō — only on an explicit marker. Covers the Sōtōshū itself and the
  // teacher-networks that descend from it: AZI/Deshimaru, Kosen Sangha,
  // Kanshōji, Zen Road, ABZE, Dōgen Sangha, Moriyama, Aoyama, Nishijima,
  // Antaiji, Suzuki/SFZC, Katagiri, and Jiyu-Kennett's OBC.
  if (
    l.includes("sōtō") ||
    l.includes("soto") ||
    l.includes("dōgen") ||
    l.includes("dogen") ||
    l.includes("deshimaru") ||
    /\bazi\b/.test(l) ||
    l.includes("kosen") ||
    l.includes("kanshoji") ||
    l.includes("kanshōji") ||
    l.includes("zen road") ||
    l.includes("abze") ||
    l.includes("nishijima") ||
    l.includes("moriyama") ||
    l.includes("aoyama") ||
    l.includes("antaiji") ||
    l.includes("shasta") ||
    l.includes("kennett") ||
    l.includes("contemplatives") ||
    l.includes("suzuki") ||
    l.includes("sfzc") ||
    l.includes("katagiri") ||
    l.includes("szba")
  )
    return "soto";

  // Nothing in the listing evidences a school. Say so, rather than filing
  // the sangha under whichever tradition happens to be the biggest.
  return "other";
}

// Source URL host → registered sourceId.
function pickSourceId(sourceUrl: string, lineage: string): string {
  const u = sourceUrl.toLowerCase();

  // Batch 28: direct Swiss, Polish, Swedish, and Norwegian organization sources.
  if (u.includes("zen-geneve.ch")) return "src_ch_zen_geneve";
  if (u.includes("zen-soto.ch")) return "src_ch_sotozen_directory";
  if (u.includes("zendoamfluss.ch")) return "src_ch_zendo_am_fluss";
  if (u.includes("kwanumeurope.org")) return "src_ch_kwan_um_europe";
  if (u.includes("kannon.pl")) return "src_pl_kannon";
  if (u.includes("zentraining.org")) return "src_se_zengarden";
  if (u.includes("stockholmzencenter.se")) return "src_se_stockholm_zen";
  if (u.includes("goteborgzencenter.se")) return "src_se_goteborg_zen";
  if (u.includes("lundzencenter.se")) return "src_se_lund_zen";
  if (u.includes("zengu.se")) return "src_se_umea_zengrupp";
  if (u.includes("zazen.se")) return "src_se_zenbuddhistiska";
  if (u.includes("haugesundzensenter.com")) return "src_no_haugesund_zen";

  // Batch 27: direct Italian and Spanish organization sources.
  if (u.includes("monasterozen.it/centri/")) return "src_italy_monasterozen_direct";
  if (u.includes("praticazen.org/it")) return "src_italy_praticazen";
  if (u.includes("zendoccidente.org")) return "src_italy_zendoccidente";
  if (u.includes("dojozenmadrid.wordpress.com")) return "src_spain_nakama";
  if (u.includes("dojozensakura.blogspot.com")) return "src_spain_sakura";
  if (u.includes("unsuizen.es")) return "src_spain_unsui";
  if (u.includes("meditacionzencantabria.es")) return "src_spain_iize_cantabria";
  if (u.includes("meditacionzenlarioja.com")) return "src_spain_iize_larioja";
  if (u.includes("sotozencatalunya.wordpress.com")) return "src_spain_sotozen_catalunya";

  if (u.includes("caminomedio.org")) return "src_camino_medio";
  if (u.includes("nalanda.cat")) return "src_nalanda_centre";
  if (u.includes("sites.google.com/site/cambsrmgroup")) return "src_cambridge_srm_group";
  if (u.includes("lancasterserenereflection.org.uk")) return "src_lancaster_srm_group";
  if (u.includes("londonfgs.org.uk")) return "src_london_fgs";

  // Direct Europe and East Asia sources from the 2026 source refresh.
  if (u.includes("lotuszencentra.nl")) return "src_lotus_zen_centra_nederland";
  if (u.includes("zencenterathens.com")) return "src_zen_center_athens";
  if (u.includes("eisenbuch.de")) return "src_eisenbuch_fumonji";
  if (u.includes("zen-vereinigung-berlin.de")) return "src_zenvereinigung_berlin";
  if (u.includes("genjoan.net")) return "src_genjoan_hamburg";
  if (u.includes("zendo-koeln.de")) return "src_zendo_koeln";
  if (u.includes("zendo-wuppertal.de")) return "src_zendo_wuppertal";
  if (u.includes("zen-kreis-kassel.de")) return "src_zenkreis_kassel";
  if (u.includes("kwanumzen.de/zentren-gruppen")) return "src_kwanum_germany_groups";
  if (u.includes("buddhismus-deutschland.de")) return "src_dbu";
  if (u.includes("zen-kloster.de")) return "src_zen_kloster";
  if (u.includes("daishinzen.de")) return "src_daishin_zen";
  if (u.includes("zendo-saar.de")) return "src_zendo_saar";
  if (u.includes("daishin-zen-ulm.de")) return "src_daishin_zen_ulm";
  if (u.includes("zen-gemeinschaft-berlin.de")) return "src_zen_gemeinschaft_berlin";
  if (u.includes("neumuehle-saar.de")) return "src_neumuehle_saar";
  if (u.includes("meditation-zen.org/de/zendojofreiburg")) return "src_zendojo_freiburg";
  if (u.includes("hannya-kai.de")) return "src_hannya_kai";
  if (u.includes("zen-dojo-offenburg.de")) return "src_zen_dojo_offenburg";
  if (u.includes("onedropzen.org/community/hokuozan")) return "src_onedropzen";
  if (u.includes("sojiji.jp")) return "src_sojiji_site";
  if (u.includes("en.at-nagasaki.jp/spot/96")) return "src_nagasaki_city_zen";
  if (u.includes("at-nagasaki.jp")) return "src_fukusai_nagasaki_tourism";
  if (u.includes("sojiji.jp/en/zazen")) return "src_sojiji_site";
  if (u.includes("shokoku-ji.jp/en/ginkakuji")) return "src_ginkakuji_site";
  if (u.includes("shokoku-ji.jp/en/about")) return "src_shokokuji_site";
  if (u.includes("shokoku-ji.jp")) return "src_shokokuji_site";
  if (u.includes("tenryuji.com")) return "src_tenryuji_site";
  if (u.includes("tofukuji.jp")) return "src_tofukuji_site";
  if (u.includes("tokeiji.com")) return "src_tokeiji_site";
  if (u.includes("zuiganji.or.jp")) return "src_zuiganji_site";
  if (u.includes("baekdamsa.templestay.com")) return "src_baekdamsa_templestay";
  if (u.includes("visitkorea.or.kr") && (u.includes("vcontsid=104966") || u.includes("baekyangsa"))) return "src_baekyangsa_visitkorea";
  // Batch 27 official and institutional sources for Japan and South Korea.
  if (u.includes("myoshinji.or.jp/application/files/9316/4249/3315")) return "src_daishuin_myoshinji_map";
  if (u.includes("shokoku-ji.jp/en/kinkakuji/about")) return "src_kinkakuji_shokoku";
  if (u.includes("kodaiji.com")) return "src_kodaiji_official";
  if (u.includes("at-nagasaki.jp/barrierfree/64161")) return "src_kofukuji_nagasaki_city";
  if (u.includes("obakusan.or.jp")) return "src_manpukuji_official";
  if (u.includes("japan.travel/en/spot/1583")) return "src_meigetsuin_jnto";
  if (u.includes("myoshinji.or.jp/english/zen/info.html")) return "src_myoshinji_public_zazen";
  if (u.includes("nanzenji.or.jp/about_rinzaishu/visit")) return "src_nanzenji_official";
  if (u.includes("ryoanji.jp/smph/eng/rode")) return "src_ryoanji_official";
  if (u.includes("city.mishima.shizuoka.jp/kanko_content001236")) return "src_ryutakuji_mishima_city";
  if (u.includes("b-izu.com/spot/post-4909")) return "src_ryutakuji_mishima_city";
  if (u.includes("sanbo-zen-international.org/en/sanun-zendo")) return "src_sanun_zendo_sanbo";
  if (u.includes("zen-shofukuji.jp")) return "src_shofukuji_kobe_official";
  if (u.includes("at-nagasaki.jp/barrierfree/64117")) return "src_shofukuji_nagasaki_city";
  if (u.includes("borimsa.org")) return "src_borimsa_official";
  if (u.includes("vcontsid=94557")) return "src_kto_bulyeongsa";
  if (u.includes("vcontsid=91058")) return "src_kto_daeseungsa";
  if (u.includes("vcontsid=92300")) return "src_kto_girimsa";
  if (u.includes("vcontsid=95051")) return "src_kto_gwanchoksa";
  if (u.includes("vcontsid=84111")) return "src_kto_heungguksa";
  if (u.includes("vcontsid=90168")) return "src_kto_hwagyesa";
  if (u.includes("vcontsid=110754")) return "src_kto_naesosa";
  if (u.includes("en.visitdaegu.or.kr/company/9")) return "src_daegu_pagyesa";
  if (u.includes("sudosa.or.kr")) return "src_sudosa_official";
  if (u.includes("maisantapsa.com")) return "src_tapsa_official";
  if (u.includes("vcontsid=73758")) return "src_kto_yeongguksa";

  // South Korea Batch 24 institutional destination evidence.
  if (u.includes("vcontsid=96644")) return "src_kto_sudeoksa";
  if (u.includes("vcontsid=110571")) return "src_kto_donghwasa";
  if (u.includes("vcontsid=111834")) return "src_kto_ssanggyesa";
  if (u.includes("vcontsid=95143")) return "src_kto_yongjusa";
  if (u.includes("vcontsid=110707")) return "src_kto_sinheungsa";
  if (u.includes("vcontsid=94392")) return "src_kto_jikjisa";
  if (u.includes("vcontsid=89729")) return "src_kto_eunhaesa";
  if (u.includes("vcontsid=94395")) return "src_kto_bulguksa_official";
  if (u.includes("vcontsid=90655")) return "src_kto_gounsa";
  if (u.includes("vcontsid=93836")) return "src_kto_geumsansa";
  if (u.includes("vcontsid=111755")) return "src_kto_hwaeomsa";
  if (u.includes("vcontsid=89961")) return "src_kto_bongwonsa";
  if (u.includes("vcontsid=110726")) return "src_kto_jeondeungsa";
  if (u.includes("nyj.go.kr/eng/contents.do?key=4417")) return "src_nyj_bongseonsa";
  if (u.includes("jokb.org/bbs/content.php?co_id=3040")) return "src_jogye_bongamsa";
  if (u.includes("beomeo.kr/about/sub9.php")) return "src_beomeosa_site";
  if (u.includes("beopjusa.org") || (u.includes("jogye") && u.includes("beopjusa"))) return "src_beopjusa_jogye";
  if (u.includes("buddhism.or.kr/jongdan/sub1/sub1-9-2-5.php")) return "src_jogye_order";
  if (u.includes("buddhismus-deutschland.de") && u.includes("hi-gi")) return "src_dbu";

  if (u.includes("dojozenlaciotatceyreste.blogspot.com/p/dojo-zen-de-ceyreste-et-la-ciotat.html"))
    return "src_dojo_zen_laciotat_blog";
  if (u.includes("pinemtnbuddhisttemple.org"))
    return "src_pine_mountain_buddhist_temple";
  if (u.includes("reddingzen.org"))
    return "src_redding_zen_buddhist_priory";
  if (u.includes("mtadamsbuddhisttemple.org/schedule"))
    return "src_mt_adams_buddhist_temple";
  if (u.includes("wallowabuddhisttemple.org"))
    return "src_wallowa_buddhist_temple";
  if (u.includes("plumblossomsangha.org/visit-us"))
    return "src_plum_blossom_sangha";
  if (u.includes("uubf.org/wp/uubf-practice-groups"))
    return "src_uubf_practice_groups";
  if (u.includes("cms.ordinterbeing.id/jadwal"))
    return "src_order_interbeing_indonesia";
  if (u.includes("zencentermanila.wordpress.com/zen-centers"))
    return "src_zen_manila_affiliates";
  if (u.includes("zencentermanila.wordpress.com"))
    return "src_zen_center_manila";
  if (u.includes("baguiozencenter.wordpress.com/schedule"))
    return "src_baguio_zen_schedule";
  if (u.includes("baguiozencenter.wordpress.com"))
    return "src_baguio_zen_center";
  if (u.includes("zenphilippines.org.ph/about-us"))
    return "src_zen_philippines";
  if (u.includes("kyclzen.sg/singapore")) return "src_kycl_singapore";
  if (u.includes("bodhizendo.org/index.php/en")) return "src_bodhi_zendo";
  if (u.includes("ddmmy.org/contact-us")) return "src_ddm_malaysia";
  if (u.includes("ctworld.org/english-96/html/07_schedule.html")) return "src_chung_tai_puli_schedule";
  if (u.includes("ctworld.org/english-96/html/")) return "src_chung_tai_puli";
  if (u.includes("fagushan.ddm.org.tw")) return "src_ddm_jinshan";
  if (u.includes("ddm.org.tw/xcevent/cont?en=a202600855")) return "src_ddm_jinshan_event_2026";
  if (u.includes("ncm.ddm.org.tw")) return "src_nung_chan";
  if (u.includes("icd.ddm.org.tw/page01_02.htm")) return "src_nung_chan_listing";
  if (u.includes("fgs.org.tw/en/templetour/index/8")) return "src_fgs_monastery_tour";
  if (u.includes("fgs.org.tw/en/organizations/transportation")) return "src_fgs_transport";
  if (u.includes("travel.taipei/file/2791")) return "src_taipei_linji_huguo_record";
  if (u.includes("travel.taipei/en/attraction/details/2354")) return "src_taipei_linji_huguo";
  if (u.includes("ctcmbkk.org/en/classes")) return "src_ctc_bangkok_classes";
  if (u.includes("ctcmbkk.org/en")) return "src_ctc_bangkok";
  if (u.includes("huepagoda.com/vi/chua/bao-quoc")) return "src_bao_quoc_hue";
  if (u.includes("phuloc.hue.gov.vn") && u.includes("chua-quoc-an")) return "src_quoc_an_hue";
  if (u.includes("svhtt.hochiminhcity.gov.vn") && u.includes("danh-sach-cac-cong-trinh")) return "src_giac_lam_hcmc_city";
  if (u.includes("ubmttq.hochiminhcity.gov.vn") && u.includes("7349")) return "src_giac_lam_hcmc_update";
  if (u.includes("csdl.vietnamtourism.gov.vn/dest/?item=25")) return "src_giac_lam_vietnam_tourism";
  if (u.includes("chutichghpgvn.vn") && u.includes("linh-chieu")) return "src_linh_chieu_vbs";
  if (u.includes("visithue.vn/thien-vien-truc-lam-bach-ma")) return "src_bach_ma_visithue";
  if (u.includes("dulich.haugiang.gov.vn/vi/tvtl")) return "src_truc_lam_hau_giang_tourism";
  if (u.includes("old.cantho.gov.vn") && u.includes("thien%2bvien%2btruc%2blam%2bphuong%2bnam")) return "src_phuong_nam_cantho_city";
  if (u.includes("pjfgs.org/online-donation/fgs-directory"))
    return "src_fgs_malaysia_directory";
  if (u.includes("kyclzen.sg/malaysia")) return "src_kycl_malaysia";
  if (u.includes("oceanskyzen.org/wp/?page_id=149"))
    return "src_ocean_sky_chan_events";
  if (u.includes("oceanskyzen.org/wp/?page_id=99"))
    return "src_ocean_sky_chan";
  if (u.includes("fgs-ph.com")) return "src_fgs_philippines";
  if (u.includes("ddsingapore.org/en/event-type")) return "src_ddm_singapore_events";
  if (u.includes("ddsingapore.org/contact-us")) return "src_ddm_singapore";
  if (u.includes("fgs.sg/contact-1")) return "src_fgs_singapore";

  if (u.includes("zenlleida.org/dojo")) return "src_dojo_zen_lleida";
  if (u.includes("zen-azi.org/index.php/fr/node/3053")) return "src_azi_charleroi";
  if (u.includes("zen-azi.org/fr/node/456")) return "src_azi_caen";
  if (u.includes("kwanumeurope.org/locations/torun-zen-group")) return "src_kwanum_torun";
  if (u.includes("kwanumeurope.org/locations/glogow-zen-group")) return "src_kwanum_glogow";
  if (u.includes("aandacht.net/meditatiegroepen/sangha-vinden2/item/"))
    return "src_leven_in_aandacht_sanghas";
  if (u.includes("aandacht.net/meditatiegroepen/sangha-vinden2"))
    return "src_leven_in_aandacht_sanghas";
  if (u.includes("zenchile.cl/projects-6")) return "src_shoden_chile_site";
  if (u.includes("kannon.pl/centrum-zen-kaciki"))
    return "src_kannon_kaciki_site";
  if (u.includes("zenstockholm.nu")) return "src_stockholms_zengrupp";
  if (u.includes("zen.is/")) return "src_nathagi_zen";
  if (u.includes("northeastserenereflection.org.uk/teesside")) return "src_teesside_group";
  if (u.includes("sanghadevalence.jimdofree.com")) return "src_sangha_valence";
  if (u.includes("kannon.pl/warszawa")) return "src_kannon_warsaw";
  if (u.includes("zenbuddhism.ie/dublin-zen-centre")) return "src_dublin_zen_centre";
  if (u.includes("kannon.pl/zielona-gora")) return "src_kannon_zielona_gora";
  if (u.includes("sangha.wroclaw.pl")) return "src_drugi_brzeg_wroclaw";
  if (u.includes("greatwave.org/locations")) return "src_great_wave_site";
  if (u.includes("whiteplum.org/membership-list-mobile/user/460"))
    return "src_empty_bowl_whiteplum";
  if (u.includes("kvanumzen.hu/en/community-sangha"))
    return "src_kwanum_hungary_community";
  if (u.includes("sotozen.com/ita/temples/jp/shoboji"))
    return "src_aichi_nisodo_soto";
  if (u.includes("plumvillage.uk/group/") || u.includes("plumvillage.uk/practice-groups/find-a-group"))
    return "src_plum_village_uk_groups";
  if (u.includes("stillwaterspvsangha.co.uk"))
    return "src_still_waters_plum_village";
  if (u.includes("mindfulnessireland.ie/sanghas-local-sanghas-across-ireland"))
    return "src_mindfulness_ireland_sanghas";
  if (u.includes("plumvillage-traditionen.se/sollandet"))
    return "src_sollandet_sangha";
  if (u.includes("plumvillage-traditionen.se/"))
    return "src_swedish_plum_village_groups";
  if (u.includes("plumvillage.org/practice-centre/plum-village-thailand"))
    return "src_thai_plum_village";
  if (u.includes("trikayazencenter.org")) return "src_trikaya_zen";
  if (u.includes("twostreamszen.org")) return "src_two_streams_zen";
  if (u.includes("upaya.org/about/affiliates")) return "src_upaya_affiliates";
  if (u.includes("zcla.org/about/affiliated-zen-groups"))
    return "src_zcla_affiliates";
  if (u.includes("zlmc.org/sunday-morning-zen"))
    return "src_zen_life_meditation_chicago";
  if (u.includes("bailinsi.net")) return "src_bailin_temple";
  if (u.includes("damingsi.com")) return "src_daming_temple";
  if (u.includes("jsfj.net/syzs_szhss")) return "src_hanshan_jiangsu_buddhist";
  if (u.includes("lingyinsi.org")) return "src_lingyin_temple";
  if (u.includes("zd.gov.cn/columns/761f6ac4"))
    return "src_linji_zhengding_government";
  if (u.includes("longthanh.dongnai.gov.vn") && u.includes("bieu2030_longthanh"))
    return "src_longthanh_religious_sites";
  if (u.includes("plumvillage-traditionen.se/groups"))
    return "src_swedish_plum_village_groups";
  if (u.includes("wakeuplondon.org")) return "src_wake_up_london";
  if (u.includes("wakeup-lund.se")) return "src_wake_up_lund";
  if (u.includes("wakeupnewyork.org")) return "src_wake_up_new_york";
  if (u.includes("wkup.org/locations/")) return "src_wake_up_directory";
  if (u.includes("oscailt.com/mindfulness-and-self-compassion/wake-up-dublin"))
    return "src_oscailt_wake_up_dublin";
  if (u.includes("wildgeesezen.org")) return "src_wild_geese_sangha";
  if (u.includes("tulliogiraldi.it")) return "src_tullio_giraldi_chudo";
  if (u.includes("buddhistdoor.net/directorio-de-comunidades-budistas-en-venezuela"))
    return "src_buddhistdoor_venezuela";
  if (u.includes("sotozencolombia.org/sangha-dokan-venezuela"))
    return "src_sotozen_colombia_dokan";
  if (u.includes("redestudiobudismo.com/directorio"))
    return "src_rieb_venezuela_directory";
  if (u.includes("bayzen.org")) return "src_bay_zen_center";
  if (u.includes("breadloafmountainzen.org")) return "src_bread_loaf_zen";
  if (u.includes("greatplainszen.org")) return "src_great_plains_zen";
  if (u.includes("zen-imgruenenring.ch")) return "src_green_ring_zen";
  if (u.includes("boundlessway.org/weekly-practice")) return "src_boundless_way";
  if (u.includes("bupponansen.org")) return "src_buppo_valencia";
  if (u.includes("sg.gov.cn/sgly/yzsg/msgj/content/post_1960276"))
    return "src_nanhua_shaoguan_government";
  if (u.includes("fjdh.cn/bnznews/2016/03/151505346042"))
    return "src_tiantong_fjdh";
  if (u.includes("zjfjxh.com") && u.includes("0171fa3c"))
    return "src_xuedou_zhejiang_buddhist";
  if (u.includes("yjsfj.pusa123.com/pusa/cxb"))
    return "src_zhenru_chan_training";
  if (u.includes("sotozencolombia.org")) return "src_sotozen_colombia";
  if (u.includes("algarvesangha.wordpress.com")) return "src_almond_blossom_sangha";
  if (u.includes("mindfulness-israel.org")) return "src_mindfulness_israel";
  if (u.includes("dharmagaia.org")) return "src_dharma_gaia";
  if (u.includes("langmai.org")) return "src_langmai_vietnam";
  if (u.includes("tnhspain.com")) return "src_tnh_spain";
  if (u.includes("joyfulgarden.sg")) return "src_joyful_garden_sg";
  if (u.includes("pvfhk.org")) return "src_plum_village_hong_kong";
  if (u.includes("dojozenbuenosaires.com.ar")) return "src_dojo_zen_buenos_aires";
  if (u.includes("maitreyazen.cl")) return "src_maitreya_zen_chile";
  if (u.includes("elzendo.com")) return "src_zendo_tunquen";
  if (u.includes("montanadesilencio.org")) return "src_montana_silencio";
  if (u.includes("casazen.org")) return "src_casa_zen_costa_rica";
  if (u.includes("casazenmexico.com")) return "src_casa_zen_mexico";
  if (u.includes("budismozen.org/mx")) return "src_dhammapada_mexico";
  if (u.includes("mardejade.com")) return "src_mar_de_jade";
  if (u.includes("sotozenperu.com")) return "src_soto_zen_peru";
  if (u.includes("sotozen.com/eng/temples/outside_jp/peru"))
    return "src_sotozen_peru_official";
  if (u.includes("mapeosociedadcivil.uy/organizaciones/asociacion-zen-del-uruguay"))
    return "src_uruguay_civil_society_map";
  if (u.includes("linztermine.at/event/722866")) return "src_zen_gruppe_linz";
  if (u.includes("zendowien.org")) return "src_zendo_wien_site";
  if (u.includes("zengruppe-wien.at")) return "src_zengruppe_wien";
  if (u.includes("chan.hr")) return "src_dharmaloka_croatia";
  if (u.includes("havredalzendo.dk")) return "src_havredal_zendo";
  if (u.includes("zazen.fi")) return "src_sanneji_zen_finland";
  if (u.includes("kajozendo.wordpress.com")) return "src_kajo_zendo";
  if (u.includes("sydanmieli.tzc.fi")) return "src_sydanmieli_zen";
  if (u.includes("tzc.fi")) return "src_tampere_zen";
  if (u.includes("zen.hu")) return "src_tan_kapuja_zen";
  if (u.includes("onedropzen.hu")) return "src_onedropzen";
  if (u.includes("mokushozen.hu")) return "src_mokusho_house";
  if (u.includes("fukugen.de")) return "src_fuku_gen_berlin";
  if (u.includes("zen.org.nz")) return "src_mountains_rivers";
  if (u.includes("zendo.org.nz") || u.includes("diamondsangha.org/resources"))
    return "src_diamond_sangha";
  if (u.includes("aucklandzen.org.nz")) return "src_auckland_zen_center";
  if (u.includes("dunedinzen.wordpress.com")) return "src_dunedin_zen";
  if (u.includes("bodhizendo.org") && u.includes("carl-hooper"))
    return "src_bodhimount_teacher";
  if (u.includes("mzg.org.au/links/other-zen-groups"))
    return "src_melbourne_zen_groups";
  if (u.includes("mildurazengroup.org")) return "src_mildura_zen";
  if (u.includes("ddmba.ca")) return "src_dharmadrum";
  if (u.includes("enpuku-ji.org")) return "src_rinzaiji";
  if (u.includes("wwzcbeta.org")) return "src_white_wind";
  if (u.includes("zjskw.gov.cn") && u.includes("40807"))
    return "src_asoka_zhejiang_social_sciences";
  if (u.includes("jsfj.net/syzs_yzh")) return "src_gaomin_jiangsu_buddhist";
  if (u.includes("hzfjxh.com") && u.includes("25691662"))
    return "src_jingci_hangzhou_buddhist";
  if (u.includes("jsfj.net/syzs_zjjsjtcs"))
    return "src_jinshan_jiangsu_buddhist";
  if (u.includes("plm.org.hk")) return "src_po_lin_monastery";
  if (u.includes("tpb.gov.hk") && u.includes("m1145tpb"))
    return "src_po_lam_hk_planning";
  if (u.includes("zazen.cz")) return "src_dojo_v_proudu";
  if (u.includes("copenhagenzen.com")) return "src_boundless_way_copenhagen";
  if (u.includes("zenbuddhistiskforening.dk")) return "src_zen_buddhistisk_forening";
  if (u.includes("akazienzendo.de")) return "src_akazienzendo";
  if (u.includes("buddhismusmuenchen.de")) return "src_bodhidharma_munich";
  if (u.includes("buddhismusnuernberg.de")) return "src_bodhidharma_nuremberg";
  if (u.includes("kurse.dharmaacademy.com")) return "src_dharma_sangha_schwarzwald";
  if (u.includes("choka-sangha.de")) return "src_choka_sangha";
  if (u.includes("zen-duesseldorf.de")) return "src_zen_duesseldorf";
  if (u.includes("citruszen.com")) return "src_citrus_zen";
  if (u.includes("columbiazen.org")) return "src_columbia_priory";
  if (u.includes("linhsonaustin.org")) return "src_linh_son_austin";
  if (u.includes("choboji.org")) return "src_choboji";
  if (u.includes("hollowboneszen.org")) return "src_hollow_bones";
  if (u.includes("korinji.org")) return "src_korinji";
  if (u.includes("linhsondetroit.net")) return "src_linh_son_detroit";
  if (u.includes("linhsondickinson.org")) return "src_linh_son_dickinson";
  if (u.includes("sotozen-navi.com")) return "src_sotozen_navi";
  if (u.includes("okayama-japan.jp/en/spot/10606")) return "src_hofukuji_okayama";
  if (u.includes("greenmountainzen.org.nz")) return "src_green_mountain_zen_site";
  if (u.includes("greenriverzen.org")) return "src_green_river_zen_site";
  if (u.includes("greyheronzen.ie")) return "src_grey_heron_zen_site";
  if (u.includes("heartcirclezen.org")) return "src_heart_circle_zen_site";
  if (u.includes("hokorizencenter.org")) return "src_hokori_zen_site";
  if (u.includes("joyfulmindzendo.org")) return "src_joyful_mind_zendo_site";
  if (u.includes("sites.google.com/view/adelaide-zen-group"))
    return "src_adelaide_zen_site";
  if (u.includes("blackmountainzen.com")) return "src_black_mountain_zen_site";
  if (u.includes("szc.org.au/our-teachers/jane-andino"))
    return "src_sydney_zen_groups";
  if (u.includes("castlemainezen.com.au")) return "src_castlemaine_zen_site";
  if (u.includes("mzg.org.au/about/who-are-we")) return "src_melbourne_zen_site";
  if (u.includes("wakeupsaopaulo.webnode.page")) return "src_wakeup_sao_paulo";
  if (u.includes("wavesandwater.org")) return "src_waves_and_water";
  if (u.includes("mindfulnessvancouver.org")) return "src_mindfulness_vancouver";
  if (u.includes("truclam.ca")) return "src_truclam_canada";
  if (u.includes("mindfulnesspracticecommunity.org"))
    return "src_mindfulness_toronto";
  if (u.includes("wakeuptoronto.ca")) return "src_wakeup_toronto";
  if (u.includes("wkup.org/locations/montreal")) return "src_wakeup_montreal";
  if (u.includes("maplevillagesangha.org")) return "src_maple_village";
  if (u.includes("obcon.org/edmonton-meditation-group")) return "src_obc_edmonton";
  if (u.includes("kwanumzen.de/zentren-gruppen")) return "src_kwanum_germany_groups";
  if (u.includes("subong.org.hk/en/content/gak-su-temple")) return "src_gak_su_site";
  if (u.includes("subong.org.hk/en/content/introduction")) return "src_su_bong_site";
  if (u.includes("ctworld.org/108/puguang3")) return "src_puguang_chung_tai";
  if (u.includes("ddmhk.org.hk/landing/support")) return "src_ddm_hong_kong";
  if (u.includes("palmettozendo.org")) return "src_palmetto_zendo";
  if (u.includes("oneriverzen.org")) return "src_one_river_zen";
  if (u.includes("oneheartsangha.org")) return "src_one_heart_sangha";
  if (u.includes("daystarzendo.org")) return "src_day_star_zendo";
  if (u.includes("fullmoonzen.org")) return "src_full_moon_zen";
  if (u.includes("canberrasotozengroup.wixsite.com")) return "src_canberra_soto_site";
  if (u.includes("dzg.org.au")) return "src_darwin_zen_site";
  if (u.includes("forestwayzen.com.au")) return "src_forest_way_zen_site";
  if (u.includes("kuanyinmeditationcentre.org")) return "src_kuan_yin_au_site";
  if (u.includes("zenhobart.com")) return "src_mountains_rivers_hobart";
  if (u.includes("openway.org.au")) return "src_open_way_au";
  if (u.includes("sites.google.com/view/morningstarzen")) return "src_morning_star_zen";
  if (u.includes("nogatezencenter.org")) return "src_no_gate_zen";
  if (u.includes("ocmz.org")) return "src_order_clear_mind";
  if (u.includes("zencommunitysi.org")) return "src_staten_island_zen";
  if (u.includes("emptyhandzen.org")) return "src_empty_hand_zen";
  if (u.includes("whiteplum.org/membership-list-mobile/user/190"))
    return "src_pamsula_whiteplum";
  if (u.includes("michaelkholleran.org")) return "src_dragons_eye_zen";
  if (u.includes("plumline.org")) return "src_plumline_directory";
  if (u.includes("interbeing.dk")) return "src_interbeing_denmark";
  if (u.includes("bonzazen.wordpress.com")) return "src_bonzazen_site";
  if (u.includes("liste_sangha_franco-08-06-2025.pdf"))
    return "src_french_pv_sanghas_2025";
  if (u.includes("liste_sangha_franco-09-02-2025.pdf"))
    return "src_french_pv_sanghas_feb_2025";
  if (u.includes("sonara.fr/evenements")) return "src_sonara_tours";
  if (u.includes("zensete.free.fr/contact")) return "src_zen_sete";
  if (u.includes("zenbernay.org")) return "src_zen_bernay";
  if (u.includes("kakunen-zen.de")) return "src_kakunenji";
  if (u.includes("zen-institut.de/wp-content/uploads/2022/12/izid")) return "src_izid";
  if (u.includes("zendoaachen.de/dojo")) return "src_zendo_aachen";
  if (u.includes("zaltho.de")) return "src_zaltho";
  if (u.includes("phathue.de/veranstaltungen/woechentliches-programm")) return "src_phat_hue";
  if (u.includes("onedropzen.net")) return "src_onedropzen";
  if (u.includes("ryu-un-zendo.org/termine")) return "src_ryu_un_zendo";
  if (u.includes("sonnenhof-holzinshaus.de")) return "src_sonnenhof";
  if (u.includes("dharma-sangha.de/uber-uns/dharma-sangha")) return "src_dharma_sangha_gottingen";
  if (u.includes("zenkreis-bremen.de/angebot/ubungszeiten")) return "src_zenkreis_bremen";
  if (u.includes("wolkentor-tempel.de/kalender-3")) return "src_wolkentor";
  if (u.includes("coeur-des-sanghas-alsace/les-sanghas/mille-p")) return "src_coeur_sanghas_mille_petales";
  if (u.includes("cms-assets.webediamovies.pro/production/1446/4e28367058f2fa16e6f18d406ee113fd.pdf")) return "src_moment_present_roanne";
  if (u.includes("zensangha.be")) return "src_zen_sangha_belgium";
  if (u.includes("meetup.com/zazen-copenhagen")) return "src_big_heart_copenhagen";
  if (u.includes("zenireland.com")) return "src_earth_sky_zen";
  if (u.includes("buddhism.be/nl/centresflandres-fr/zen-dojo-turnhout"))
    return "src_turnhout_bbu";
  if (u.includes("zen-deshimaru.com.ar/dojo-zen-de-montevideo"))
    return "src_montevideo_kosen";
  if (u.includes("wkup.org/meetings/")) return "src_wake_up_directory";
  if (u.includes("intersein.de/gemeinschaften")) return "src_intersein_germany";
  if (u.includes("riviereducoeur.webnode.fr")) return "src_riviere_coeur";
  if (u.includes("contact79094.wixsite.com/sanghadelille"))
    return "src_hauts_france_pv";
  if (u.includes("zazen.com.ar")) return "src_ermita_paja";
  if (u.includes("ordinarymind.org.au")) return "src_ordinary_mind_au";
  if (u.includes("zenmelbourne.com")) return "src_zen_melbourne";
  if (u.includes("ordinarymind.com.au")) return "src_ozzen";
  if (u.includes("szc.org.au")) return "src_sydney_zen";
  if (u.includes("netiparekh.com")) return "src_twining_vines_au";
  if (u.includes("zgwa.org.au")) return "src_zgwa";
  if (u.includes("bergzendo.at")) return "src_bergzendo";
  if (u.includes("stille-in-wien.at")) return "src_stille_wien";
  if (u.includes("izen.nl")) return "src_izen";
  if (u.includes("zenpunt.nl")) return "src_zenpunt";
  if (u.includes("kanzeon.pl")) return "src_kanzeon_poland";
  if (u.includes("bornastheearth.com")) return "src_born_earth";
  if (u.includes("svalornassangha.org")) return "src_svalornas";
  if (u.includes("wholeheartedzensangha.uk")) return "src_wholehearted_zen";
  if (u.includes("sanghazenpt.org")) return "src_wild_flower_pt";
  if (u.includes("constellationdulac.wixsite.com")) return "src_constellation_lac";
  if (u.includes("maisonauxcedresbleus.com")) return "src_cedres_bleus";
  if (u.includes("sanghasduvillagedespruniersenprovence.over-blog.com"))
    return "src_fleur_tamaris";
  if (u.includes("fleurdelinstant.fr")) return "src_fleur_instant";
  if (u.includes("fleursdeprunier-rennes.blogspot.com")) return "src_fleurs_prunier";
  if (u.includes("fleursdevacuite.org")) return "src_fleurs_vacuite";
  if (u.includes("coeur-des-sanghas-alsace/les-sanghas/fleurs-de-zen"))
    return "src_fleurs_zen";
  if (u.includes("zengruppe-linz.at")) return "src_zen_gruppe_linz";
  if (u.includes("zendowien.org")) return "src_zendo_wien_site";
  if (u.includes("zengruppe-wien.at")) return "src_zengruppe_wien";
  if (u.includes("centre-bouddhiste-zen-des-pagodes.be")) return "src_pagodes_zen";
  if (u.includes("shikantaza.be")) return "src_shikantaza_mons";
  if (u.includes("daisen.eu")) return "src_daisen";
  if (u.includes("zendogensangha.be")) return "src_zen_dogen_belgium";
  if (u.includes("zenmeditatiehasselt.be")) return "src_gyoji";
  if (u.includes("zenmontanasymar.org")) return "src_zen_montanas_y_mar";
  if (u.includes("zen-vientodelsur.com.ar")) return "src_zen_viento_del_sur";
  if (u.includes("/el-centro-zen-de-mexico-ar")) return "src_centro_zen_mexico_szba";
  if (u.includes("sotozen.org.br")) return "src_busshinji_brazil";
  if (u.includes("mosteiroeishoji.org")) return "src_eishoji";
  if (u.includes("viazen.org.br")) return "src_via_zen_br";
  if (u.includes("zendocuritiba.com.br")) return "src_zendo_curitiba";
  if (u.includes("storder.org/centers")) return "src_atlantic_soto";
  if (u.includes("sanghadescistes.blogspot.com")) return "src_cistes_sangha";
  if (u.includes("lejardindelinstant.alwaysdata.net")) return "src_jardin_instant";
  if (u.includes("sangha-thich-nhat-hanh-de-lardeche.jimdosite.com"))
    return "src_joie_conscience";
  if (u.includes("eonzen.org")) return "src_eon_zen";
  if (u.includes("flowingriversangha.com")) return "src_flowing_river";
  if (u.includes("gmzc.org")) return "src_great_mountain";
  if (u.includes("greatplainszen.org")) return "src_great_plains";
  if (u.includes("morganbayzendo.org")) return "src_morgan_bay";
  if (u.includes("lostcoinzen.com")) return "src_lost_coin";
  if (u.includes("newriverzen.org")) return "src_new_river";
  if (u.includes("bouddhisme-thich-nhat-hanh-angers.blogspot.com"))
    return "src_angers_sangha";
  if (u.includes("chemindeveil.over-blog.com")) return "src_chemin_eveil";
  if (u.includes("centrogyosho.it")) return "src_gyosho_it";
  if (u.includes("tenshin.it")) return "src_tenshin_it";
  if (u.includes("zenshinji.org")) return "src_zenshinji_it";
  if (u.includes("zentrum.nl")) return "src_zentrum_nl";
  if (u.includes("zennijmegen.nl")) return "src_zen_nijmegen";
  if (u.includes("zen-bonn.de")) return "src_zen_bonn";
  if (u.includes("shobogendo.de")) return "src_shobogendo_de";
  if (u.includes("zen-kreis-hamburg.de")) return "src_zen_kreis_hamburg";
  if (u.includes("liste_sangha_franco-15-04-2024.pdf")) return "src_french_pv_sanghas_2024";
  if (u.includes("wolkenundwasser.de")) return "src_wolken_wasser_de";
  if (u.includes("zen-muenster.de")) return "src_zen_muenster";
  if (u.includes("zen-augsburg.de")) return "src_zen_augsburg";
  if (u.includes("zenkreis-kiel.de")) return "src_zenkreis_kiel";
  if (u.includes("zen-vereinigung.de")) return "src_zenvereinigung_de";
  if (u.includes("qigong-gesellschaft.de")) return "src_qigong_tao_bamberg";
  if (u.includes("keb-rv.de")) return "src_keb_ravensburg";
  if (u.includes("sotozen.de")) return "src_sotozen_de";
  if (u.includes("sites.google.com/view/sanko-meditation-reims")) return "src_sanko_reims";
  if (u.includes("dogensangha.fr")) return "src_dogen_sangha_fr";
  if (u.includes("myoshinji.or.jp")) return "src_myoshinji_official";
  if (u.includes("nanzen.net")) return "src_nanzenji_official";
  if (u.includes("obakusan.or.jp")) return "src_manpukuji_official";
  if (u.includes("kokeizan.or.jp")) return "src_eihoji_official";
  if (u.includes("zeninstitute.org")) return "src_noorder_poort";
  if (u.includes("zenamsterdam.nl")) return "src_zen_amsterdam";
  if (u.includes("zen.nl/")) return "src_zen_nl";
  if (u.includes("ki-zen.nl")) return "src_ki_zen";
  if (u.includes("kenkon.org")) return "src_kenkon";
  if (u.includes("truclamyentu.com.vn")) return "src_truc_lam_yen_tu_official";
  if (u.includes("lamdong.gov.vn")) return "src_lamdong_truc_lam";
  if (u.includes("dulichphutho.gov.vn")) return "src_phutho_tay_thien";
  if (u.includes("dulich.dongthap.gov.vn")) return "src_dongthap_chanh_giac";
  if (u.includes("thienviensungphuc.net")) return "src_sung_phuc_official";
  if (u.includes("truclamhamrong.com")) return "src_ham_rong_official";
  if (u.includes("thienvientueduc.org")) return "src_tue_duc_official";
  if (u.includes("avatamsaka.ca")) return "src_avatamsaka_ca";
  if (u.includes("calgarysotozen.org")) return "src_calgary_soto";
  if (u.includes("clearwayzen.ca")) return "src_clear_way_ca";
  if (u.includes("londonzencentre.org")) return "src_london_zen_ca";
  if (u.includes("zenmontreal.org/calendar")) return "src_montreal_zen";
  if (u.includes("rockymountainzen.weebly.com")) return "src_rocky_mountain_ca";
  if (u.includes("torontozen.org")) return "src_toronto_zen";
  if (u.includes("wwzc.org")) return "src_white_wind";
  if (u.includes("zenbuddhisttemple.org/toronto"))
    return "src_zen_buddhist_toronto";
  if (u.includes("zenwest.ca")) return "src_zenwest";
  if (u.includes("lapluiedudharma.fr")) return "src_pluie_dharma";
  if (u.includes("pluiequifleurit.net")) return "src_pluie_fleurit";
  if (u.includes("coeur-des-sanghas-alsace/les-sanghas/rivi"))
    return "src_alsace_riviere";
  if (u.includes("unlotussepanouitaperpignan.blogspot.com"))
    return "src_un_lotus_perpignan";
  if (u.includes("openmindzen.com")) return "src_open_mind_zen";
  if (u.includes("villagezendo.org/zen-centers"))
    return "src_village_zendo_affiliates";
  if (u.includes("prairiezen.org")) return "src_prairie_zen";
  if (u.includes("rmerc.org")) return "src_rmerc";
  if (u.includes("sagetaos.com")) return "src_sage_taos";
  if (u.includes("slozc.org")) return "src_slo_zen";
  if (u.includes("santarosazengroup.org")) return "src_santa_rosa_zen";
  if (u.includes("southernwvzen.org")) return "src_southern_wv_zen";
  if (u.includes("swzc.org")) return "src_sweetwater_zen";

  // ── North-American sect umbrellas ───────────────────────────────────
  if (u.includes("szba.org")) return "src_szba";
  if (u.includes("sfzc.org")) return "src_sfzc";
  if (u.includes("zmm.org") || u.includes("mountainsandrivers"))
    return "src_mountains_rivers";
  if (u.includes("diamondsangha.org")) return "src_diamond_sangha";
  if (u.includes("rinzaiji.org")) return "src_rinzaiji";

  // ── Pan-European / sect networks ────────────────────────────────────
  if (u.includes("zen-deshimaru.com.ar/eventos/lista")) return "src_kosen_sangha_events_2026";
  if (u.includes("zen-deshimaru.com")) return "src_kosen_sangha";
  if (u.includes("seikyuji.org/donde-practicar")) return "src_seikyuji_dojos";
  if (u.includes("kanshoji.org")) return "src_kanshoji";
  if (u.includes("zen-road.org")) return "src_zen_road";
  if (u.includes("abzen.eu")) return "src_abze";
  // Sōtōshū has multiple sites — distinguish them by exact path:
  //   sotozen.com/eng/temples/regional_office/europe.html  → European office
  //   global.sotozen-net.or.jp/eng/temples/europe/         → legacy European office (now redirects)
  //   sotozen.com (other English paths)                    → Japanese head office (international site)
  //   sotozen-net.or.jp                                    → Japanese head office (Japanese site)
  //   sotozen-navi.com                                     → foreign-friendly portal
  if (u.includes("sotozen-navi.com")) return "src_sotozen_navi";
  if (
    u.includes("sotozen.com/eng/temples/regional_office/europe") ||
    u.includes("global.sotozen-net.or.jp/eng/temples/europe")
  )
    return "src_sotozen_europe";
  if (u.includes("sotozen-net.or.jp") || u.includes("sotozen.com"))
    return "src_sotozen_jp";
  if (u.includes("zen.rinnou.net")) return "src_rinnou";
  if (u.includes("buddhanet.info")) return "src_buddhanet";
  if (u.includes("giacngo.vn")) return "src_giacngo_vn";
  if (u.includes("vietnamtourism.vn")) return "src_vietnam_national_tourism";
  if (u.includes("visithue.vn")) return "src_visithue_tu_dam";
  if (u.includes("nanhuatemple.org")) return "src_nanhua_south_africa_official";
  if (u.includes("zenpeacemakers.org/membership/affiliate-network")) return "src_zen_peacemakers_affiliates";
  if (u.includes("whiteplum.org/membership-list-public")) return "src_whiteplum_membership";
  if (u.includes("brcixopo.co.za")) return "src_brc_ixopo_official";
  if (u.includes("phatgiao.org.vn")) return "src_phatgiao_vn";
  if (u.includes("iriz.hanazono.ac.jp")) return "src_iriz_hanazono";
  if (u.includes("zen-kaisen.ru")) return "src_sando_kaisen";
  if (
    u.includes("dharmadrumretreat.org") ||
    u.includes("dharmadrum.org") ||
    u.includes("chancenter.org")
  )
    return "src_dharmadrum";
  if (u.includes("zen-azi.org")) return "src_azi";
  if (u.includes("meditation-zen.org")) return "src_zen_ryumonji_dojo";
  if (u.includes("zen-mainz.de")) return "src_zen_mainz";
  if (u.includes("zen-darmstadt.de")) return "src_zen_darmstadt";
  if (u.includes("zeneindhoven.nl")) return "src_zen_eindhoven";
  if (u.includes("zenrotterdam.nl")) return "src_zen_rotterdam";
  if (u.includes("mahakarunachan.nl")) return "src_maha_karuna_chan";
  if (u.includes("zen-heilbronn.app")) return "src_zen_heilbronn";
  if (u.includes("ibps.nl")) return "src_foguang";
  if (u.includes("sanbo-zen")) return "src_sanbozen";
  if (u.includes("onedropzen")) return "src_onedropzen";
  if (u.includes("whiteplum.org")) return "src_whiteplum";

  // ── Plum Village national directories all credit Plum Village ───────
  if (
    u.includes("plumvillage.org") ||
    u.includes("plumvillage.uk") ||
    u.includes("langmai.org") ||
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

  if (u.includes("budismo.com")) return "src_budismo_com";
  if (u.includes("wikipedia.org")) return "src_wikipedia"; // any-language Wikipedia

  // ── Lineage-based fallbacks ─────────────────────────────────────────
  const l = lineage.toLowerCase();
  if (l.includes("kanshoji")) return "src_kanshoji";
  if (l.includes("kosen sangha")) return "src_kosen_sangha";
  if (
    l.includes("plum village") ||
    l.includes("thich nhat hanh") ||
    l.includes("thích nhất hạnh")
  )
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
// Keyed by the raw `name` field. Values are [lat, lng] — or
// [lat, lng, precision] when the coordinate is deliberately approximate
// (a national network with no single site, a retreat whose location the
// community does not publish). Omitting the third element means "exact":
// this pin is the place itself, verified against a named source.
const MANUAL_COORDS: Record<string, ManualCoord> = {
  "Taisenji — Mokusho Zen House": [47.5186097, 19.1621857], // OSM place of worship, Rákosi út 77
  "Stockholms Zengrupp": [59.3135399, 18.0901083], // Erstagatan 28, published group venue
  "Zen á Íslandi – Nátthagi (Night Pasture)": [64.1168872, -21.7854704], // Klettháls 1, published group venue
  "Teesside Serene Reflection Meditation Group": [54.5543566, -1.2587529], // Middlesbrough Quaker Meeting House, 131 Cambridge Road
  "Buddyjska Wspólnota Zen Kannon — Warszawa": [52.2246106, 21.0166778], // Wilcza 27B, published group venue
  "Baguio Zen Center (Mountain Sangha)": [16.4022859, 120.6037359, "city"], // Wagner Road, approximate meeting-area pin
  "Zen Philippines (Zen Center of Oriental Spirituality)": [14.6298341, 121.0881418, "city"], // St. Claire Street, Provident Villages, Marikina
  "Dharma Drum Mountain Singapore": [1.3278742, 103.8907961, "city"], // 146B Paya Lebar Road, Ace Building
  "Kwan Yin Chan Lin Zen Meditation Centre": [1.3142791, 103.8825277, "city"], // Lorong 25 Geylang, approximate venue pin
  "Zen-Kreis-Kassel e.V. (Toku Ko Kai)": [51.3204995, 9.4952746], // Fabrik Chassalla, Sickingenstraße 10
  "Zen-Dojo Kyōdaizan Leipzig": [51.3178903, 12.3260135], // Alte Handelsschule, Gießerstraße 75
  // Current meeting addresses resolved in OpenStreetMap on 2026-10-08.
  "Great Wave Zen Sangha": [43.9580256, -86.4493713],
  "Empty Bowl Zendo": [40.7956144, -74.4794622],
  "Heart Circle Sangha": [40.8981078, -74.0409353],
  "Palmetto Zendo": [26.640628, -81.8723084, "city"], // Fort Myers; current venue is 13411 Shire Lane
  "One River Zen": [41.3399559, -88.8395557], // 121 E Prospect Ave, Ottawa IL
  "Silver Spring Zendo / One Heart Sangha": [38.9852993, -77.0366559], // Washington Ethical Society, DC
  "Day Star Sangha": [42.0667652, -71.3281114, "city"], // Wrentham; exact retreat-house address is not public
  "Full Moon Zen": [42.3762832, -71.1267099], // Friends Meeting at Cambridge, 5 Longfellow Park
  "Canberra Soto Zen Group": [-35.2451460, 149.1250813, "city"], // 32 Archibald St; OSM resolves the street, not doorway
  "No Gate Zen Center": [35.0789884, -106.6092587], // Tea House Zendo, 3210 Silver Ave SE
  "Zen Community of Staten Island": [40.6418756, -74.1019417], // Emma's Place, Snug Harbor, 1000 Richmond Terrace
  "Empty Hand Zen Center": [40.9105253, -73.7820689], // 45 Lawton Street, New Rochelle
  "Pamsula Zen Center": [41.6666007, -91.5204745], // Iowa City Zen Center, 1025 Fairchild Street
  "Fleurs d’ajoncs (formerly Sangha 53, Mayenne)": [48.1507819, -0.6491274, "city"], // Mayenne; 2025 directory gives department, no venue
  "Zen Sangha — local group Antwerpen": [51.2217328, 4.4153261],
  "Zen Sangha — local group Brussel/Bruxelles": [50.8267573, 4.3535380],
  "Zen Sangha — local group Brugge": [51.2139090, 3.2432101],
  "Zen Sangha — local group Mol": [51.1855336, 5.1123716],
  "Zen Sangha — local group Jodoigne": [50.7017700, 4.8239556],
  "Wake Up Wien": [48.2092536, 16.3811241, "city"], // OSM resolves Biberstraße, not the unit doorway
  "Big Heart Zen Copenhagen": [55.6469240, 12.5553160],
  "Earth+Sky Zen — Dublin Dojo": [53.3590102, -6.2619679, "city"], // OSM resolves Gardiner Street, not number 1
  "Sangha Cercle des Montagnes (Crolles)": [45.2840499, 5.8825027], // MJC de Crolles
  "Ermita de Paja — Centro de Práctica Zen": [-34.5774619, -58.4654197],
  "Zen Group of Western Australia": [-32.0644694, 115.7574431],
  "Twining Vines Zen Centre (Katto-an Temple)": [-35.2451460, 149.1250813],
  "OzZen (Australian Ordinary Mind Zen School)": [-30.3670637, 153.0997172],
  "The Friends Dojo": [-33.7062100, 151.1254040],
  "Stichting Izen Utrecht": [52.0882281, 5.1246622],
  "Sangha Constellation du Lac (Annecy)": [45.9262322, 6.0616577],
  "Sangha Fleurs de Prunier (Rennes)": [48.1030356, -1.6348873],
  // These sources identify the current city or street, but OSM does not
  // resolve a specific entrance for the published place.
  "Green River Zen Center": [42.472974, -72.5832895, "city"],
  "Joyful Mind Zendo": [39.0817985, -77.1516844, "city"],
  "Hokori Zen Center": [28.0394654, -81.9498042, "city"],
  // OSM resolves the Kąciki street, but not house number 5.
  "Wspólnota Zen Kannon — Kąciki (ośrodek odosobnień)": [
    51.9851677, 21.4447928, "city",
  ],
  // These current venue addresses are published by Leven in Aandacht and
  // resolved to the named house or venue in OpenStreetMap on 2026-10-08.
  "Sangha De Lotusknop Antwerpen": [51.2086559, 4.4805551],
  "Sangha Baardegem (Aalst)": [50.9635114, 4.1381842],
  "Sangha Gent (Plum Village)": [51.054021, 3.7494727],
  "Sangha Pepingen": [50.7487159, 4.1852683],
  "Sangha Landen (Neerwinden)": [50.7657665, 5.0445273],
  // OSM resolves Meuletiende but not number 10; leave the Turnhout pin
  // approximate rather than putting an exact marker at the old town point.
  "Interzijn in Aandacht Turnhout": [51.3300729, 4.9574337, "city"],
  // AZI lists the current Garches address; OSM resolves the house number.
  "Dojo Zen de Garches": [48.846621, 2.188431],
  // The dojo's old Anselm Clavé pin is obsolete. Its current site gives
  // Torres de Sanui 5; OSM resolves the street but not that doorway, so
  // keep the marker approximate until the entrance is independently mapped.
  "Dojo Zen Lleida": [41.6177135, 0.619223, "city"],
  "Jikishoan Zen Buddhist Community": [-37.7434, 144.9988], // Preston VIC 3072
  "Melbourne Zen Group": [-37.7589, 144.9876], // CERES Environment Park, Brunswick East
  "Centrum Oko Lesa (Sandō Kaisen — retreat)": [49.8175, 15.473, "city"], // Czech centroid (rural retreat, exact loc not public)
  "Europäisches Zentrum für Meditation und Begegnung Neumühle": [49.4756, 6.5697], // Mettlach-Tünsdorf 66693
  "Sangha Aman à Breman (Plouguiel)": [48.7833, -3.2667], // Plouguiel, Côtes-d'Armor
  "Shawbottom Farm Retreat": [52.45, -2.75, "city"], // Shropshire approx (WCF retreat venue)
  "Po Lin Monastery (Po Lin Chansi)": [22.2548, 113.9051], // Ngong Ping plateau, Lantau
  "Lotus Pond Temple (Plum Village Hong Kong, Asian Institute of Applied Buddhism)": [22.2553, 113.905], // Ngong Ping, Lantau
  "Su Bong Zen Monastery": [22.2780, 114.1841, "city"], // current site confirms a Hong Kong city centre but publishes no address
  "Gak Su Temple International Zen Center": [22.2611, 113.9089], // Luk Wu, Lantau
  "Puguang Meditation Center (Chung Tai Chan Monastery Hong Kong Branch)": [22.278, 114.1747], // Wanchai
  "Dharma Drum Mountain Hong Kong Center (DDM Hong Kong)": [22.3373, 114.1467], // Lai Chi Kok, Kowloon
  "Po Lam Monastery (Po Lam Chan Monastery)": [22.2783, 113.9381], // Tei Tong Tsai, Lantau
  // Was [45.7833, 15.3667], which is over the border in Slovenia — the park
  // straddles it. OSM centroid for the Croatian park polygon.
  "Chan Retreat Center Hartovski Vrh (Dharmaloka)": [45.7487977, 15.4331647], // Žumberak Nature Park, HR
  "Bodhi Zendo": [10.241, 77.504], // Perumalmalai, near Kodaikanal
  "Dharma Drum Mountain Malaysia Centre": [3.175, 101.565], // Kwasa Damansara
  "Zen Peacemakers Lage Landen (ZPLL)": [52.1326, 5.2913, "city"], // NL centroid (NL/BE network)
  "Grupa Zen Kwan Um Płock": [52.5468, 19.7064], // Płock
  "Almond Blossom Sangha (Sangha Flor de Amêndoeira)": [37.0194, -7.9304], // Faro, Algarve
  Zengården: [59.45, 15.65], // Finnåker near Arboga
  "Plum Village Swiss Inter-Sangha": [46.948, 7.4474, "city"], // Swiss centroid (Bern); national network
  "Community of Mindfulness in Israel (Plum Village)": [32.0853, 34.7818, "city"], // Tel Aviv (national network)
  "Sangha Amsterdam Oost - Diemen (Plum Village)": [52.3439, 4.9619], // Amsterdam-Oost / Diemen
  // GB entries whose street address Nominatim could not resolve, so the
  // pin silently fell back to a city centroid — which lands in the wrong
  // place entirely when the city name is ambiguous ("Hayes") or huge
  // ("London"). Coordinates below are the Royal Mail postcode centroids
  // for the address each group publishes, via api.postcodes.io (all
  // quality=1, i.e. exact unit-postcode match).
  "StoneWater Zen Kent": [51.377278, 0.010525], // BR2 7EH — Hayes, Bromley (NOT Hayes, Hillingdon)
  "Kwan Um London Zen Centre": [51.572172, -0.118631], // N4 4BY — Crouch Hill, Islington
  "Wake Up London": [51.510773, -0.126639], // WC2N 4EH — Hop Gardens, Westminster
  "Telford Buddhist Priory": [52.682995, -2.470188], // TF3 5BH — The Rock, Telford
  // Nominatim used to resolve these three and no longer does, so a plain
  // re-run silently replaced good pins with city centroids (both Obama
  // temples collapsing onto one shared point). Pinned here to the values
  // OSM itself still returns for the temple nodes, so the generated file
  // is stable across upstream drift rather than degrading each rebuild.
  "Hosshin-ji (Reishō-zan Hosshin-ji)": [35.4885764, 135.7426698], // OSM node 発心寺, Obama
  "Bukkoku-ji": [35.4883639, 135.7463069], // OSM node 佛国寺, Obama
  // Both CDMX entries fall back to the Mexico City centroid (the Zócalo):
  // Dhammapada publishes no street address at all, and Nominatim cannot
  // resolve Centro Zen's. Pinned to the neighbourhood each one actually
  // names — they are ~11km apart and were previously stacked on one point.
  "Dhammapada Budismo Zen — Dōjō Zen México": [19.2633607, -99.1047377], // Xochimilco, per its own listing
  "El Centro Zen de México, A.R.": [19.3358444, -99.133589], // Col. Educación, CP 04400, Coyoacán
  // Both fell back to the Haenam County centroid, so two temples ~20km apart
  // shared one pin. OSM nodes for 대흥사 / 미황사.
  "Daeheung-sa": [34.4763626, 126.6159543], // Samsan-myeon, Haenam
  "Mihwang-sa": [34.3825907, 126.5775436], // Songji-myeon, Dalmasan, Haenam

  // ── Ancestral seats pinned to their town, sometimes tens of km away ──
  // Each pair below shared a single county or city centroid, so two
  // temples that are a mountain range apart drew one marker. Coordinates
  // are the Wikipedia infobox value for the temple, cross-checked against
  // the OSM node for its native name where one exists.
  //
  // Hangzhou centroid (30.2489634, 120.2052342) held both of these:
  "Lingyin Temple": [30.24277778, 120.09666667], // 灵隐寺, Lingyin Rd — ~10km W of the centroid
  "Jingci Temple": [30.2295, 120.149], // 净慈寺, foot of Nanping Hill by West Lake
  // Yangzhou centroid (32.3968554, 119.4077658) held both of these:
  "Daming Temple": [32.42166667, 119.40833333], // 大明寺, middle peak of Shugang Hill
  "Gaomin Temple": [32.32666667, 119.41277778], // 高旻寺, Hanjiang District — ~10km S of Daming
  "Zhenru Chan Temple (Yunju Shan)": [29.097687, 115.591501], // 真如禅寺, Mount Yunju — was ~10km E
  // Kamakura centroid (35.3192808, 139.5469627) held both of these. They
  // are the first- and second-ranked temples of the Kamakura Gozan and sit
  // about 1.5km apart, not on top of one another.
  "Kenchō-ji": [35.33178889, 139.55534722], // 建長寺, Yamanouchi
  "Engaku-ji": [35.3377, 139.5475], // 円覚寺, Yamanouchi — north of Kenchō-ji
  "Daihonzan Sōji-ji Sōin": [37.28638889, 136.77055556], // 總持寺祖院, Monzen, Wajima — was ~16km NE
  // Daegu centroid (35.8760013, 128.5960548) held both Palgongsan temples:
  "Donghwa-sa": [35.99305556, 128.70416667], // 동화사, Palgongsan
  "Pagye-sa": [36.0011, 128.6411], // 파계사, Palgongsan — ~9km W of Donghwa-sa
  // Gimcheon centroid (36.1398035, 128.1139534) held both of these:
  "Jikji-sa": [36.1165, 128.00433333], // 직지사, Hwangaksan
  // Mungyeong centroid (36.5858541, 128.1870612) held both of these:
  "Bongam-sa": [36.699813, 128.008054], // 봉암사, Huiyangsan — seat of the 1947 Seon reform
  "Daeseung-sa": [36.749427, 128.272005], // 대승사, Sabulsan — ~24km NE of Bongam-sa
  // Huế centroid (16.4639321, 107.5863388) held four separate temples:
  "Chùa Quốc Ân": [16.442934, 107.587712], // Đặng Huy Trứ, Thuận Hóa
  "Chùa Báo Quốc": [16.454268, 107.579662], // Bảo Quốc, Thuận Hóa

  // ── 2026-08-13 coverage pass: gap countries ─────────────────────────
  // Each of these publishes a street address that Nominatim resolved only
  // to the capital's centroid, so the pin was landing tens of km from the
  // sangha. Values below are the OSM node for the address itself.
  "Templo Ryūzan Zuihōji": [-12.127935, -77.020262], // OSM node "Templo Zuihoji", Calle Julián Arias Aragüez 652, Miraflores
  "Minsk Zen Group": [53.953531, 27.603486], // вуліца Кальцова 28, Sielhaspasiolak, Minsk 220131
  "One Drop Zen Latvia": [56.956569, 24.126809], // Tērbatas iela 49/51, Centrs, Rīga LV-1011
  // Dunajska cesta 102 resolves to the SGGOŠ school building — which is
  // exactly where the sangha says it sits, in the school's dance hall.
  "One Drop Zendo Slovenija": [46.07314, 14.51343], // SGGOŠ, Dunajska cesta 102, Bežigrad
  // Ama Samy's newer foundation shares the hill village of Perumalmalai
  // with Bodhi Zendo; the village, not the building, is what is knowable
  // from published sources, so this pin says so.
  "Kanzeon Zendo": [10.265243, 77.547472, "city"], // Perumalmalai, Kodaikanal 624101
  // Five Trúc Lâm monasteries in Phước Thái, Đồng Nai were stacked on one
  // provincial centroid. OSM has nodes for two of them; the rest keep a
  // town-level pin, which the map now labels as approximate.
  "Thiền viện Thường Chiếu": [10.684166, 107.026441], // Ấp 1C, Xã Phước Thái
  "Thiền viện Linh Chiếu": [10.685185, 107.024108], // Hiền Đức, Xã Phước Thái

  // ── 2026-08-16 address audit ────────────────────────────────────────
  // Each of these publishes a street address the geocoder resolved only to
  // its town, so the pin sat anywhere from a few hundred metres to 30km
  // from the door. Addresses re-read from each sangha's own site and
  // cross-checked against a second source before moving the pin.
  "Sonoma Mountain Zen Center / Genjoji": [38.36694, -122.57833], // 6367 Sonoma Mountain Road, Santa Rosa CA 95404
  "Kansas Zen Center - Kansas City": [39.0347, -94.5904], // Unity Temple on the Plaza, 707 W 47th St, Kansas City MO
  "Morning Star Zendo": [40.72721, -74.06934], // 50 Glenwood Ave, Jersey City NJ 07306
  "Beginner's Mind Zen Center": [34.23998, -118.51279], // 9325 Lasaine Ave, Northridge CA 91325
  "Association Zen de Montréal (Dojo Zen de Montréal)": [45.52878, -73.5832], // 982 rue Gilford, Plateau-Mont-Royal
  "Chùa Long Sơn": [12.2508, 109.1804], // 22 đường 23 Tháng 10, Phương Sơn, Nha Trang — foot of Trại Thủy hill
  "StoneWater Zen South London": [51.4459, -0.1189], // Streatham & Brixton Quaker Meeting House, Brixton Hill
  "Shodo Dojo Halle (Pavilion of Silence)": [50.72484, 4.21454], // Edingensesteenweg 455-457, 1500 Halle
  "Zen Dogen Sangha Belgique — La Hulpe": [50.72935, 4.47785], // Centre Oxyzen, 55 av. Reine Astrid, 1310 La Hulpe
  "Zen Dogen Sangha Belgique — Louvain-la-Neuve": [50.6674, 4.6099], // Centre Reliance, 14 rue Basse, 1348 LLN
  "Eredeti Fény — Esztergom Főtemplom (Sosei Zen kolostor projekt)": [47.78758, 18.79438], // Búbosbanka u. 61, Esztergom
  "Two Rivers Zen Community": [41.60834, -75.06144], // Bendowa Temple, 76 Main St, Narrowsburg NY 12764
  // Three where the extract's own address was wrong, so a correct geocode
  // of it still produced a wrong pin. Raw records corrected alongside.
  // 祥福寺 is in Gomiya-chō, not Hirano-chō: OSM's node for the temple, the
  // ja.wikipedia infobox and the NAVITIME listing all agree.
  "Shōfuku-ji": [34.693532, 135.169869], // 22-17 五宮町, Hyōgo-ku, Kobe 652-0007
  // Filed under Nantes, but the AZI dojo directory gives the group a
  // purpose-built temple 65km west on the coast — its own domain reads
  // "zensotolabaule".
  "Association zen de Loire-Atlantique Chô On-Ji": [47.28962, -2.3673], // 65 av. Guy de La Morandais, 44500 La Baule-Escoublac
  // Five pairs that had collapsed onto one town centroid each, so two
  // unrelated sanghas drew a single marker. Splitting them apart: the one
  // with a published venue gets it; the one that only names a city keeps a
  // centroid, now explicitly marked approximate rather than inherited.
  "Bo Hyun Sa": [26.03105, -80.39124], // 7110 SW 182nd Way, Southwest Ranches FL 33331
  "South Florida Zen Group": [26.05865, -80.33815, "city"], // Kwan Um sangha; sits at Bo Hyun Sa and a Dania Beach venue
  "Birmingham Chan Group": [52.46953, -1.91592], // Friends Meeting House, St James Rd, Edgbaston B15 1JP
  "Birmingham Sangha": [52.42964, -1.89932], // Kings Heath Meeting House, 17 Colmore Rd, B14 7PE
  "Santa Rosa Zen Group": [38.41041, -122.55013], // The Kenwood Depot, 314 Warm Springs Rd, Kenwood CA 95452
  "Sangha Dōkan Venezuela": [10.5031893, -66.9156026], // Esquina de Pajaritos, Avenida Oeste 6, Caracas
  "Centro Zen Buppo Valencia": [10.22954, -67.99826], // Aries 90-40, Trigal Norte, Valencia
  "The Gateless Gate Zen Center": [29.65197, -82.32498, "city"], // Gainesville FL; Kwan Um group, no published venue
  // The only address anyone publishes for Joshu Zen Temple is its founder's
  // house — the address Indiana denied a religious exemption to in 2015 —
  // and its own domain is dead. We are not putting a private home on a
  // public map to gain 28km of precision. Left on the Indianapolis pin it
  // already had, now honestly labelled. Previously "exact", which also put
  // it 23m from the unrelated Indianapolis Zen Center.
  "Joshu Zen Temple": [39.7683331, -86.1583502, "city"],

  // ── Second pass: venues published by the group, pin on the town ─────
  // Each of these names a hall on its own site or its network's contact
  // page, while the pin sat on a city centroid — in Sandnes's case 40km
  // inland from the town it is named after.
  "Centre Zen Maha Muni Paris": [48.85048, 2.40191], // 31 rue de Buzenval, 75020 — moved from rue de Seine, 6e
  "Zen Gruppe Salzburg": [47.92893, 13.12241], // Yoga Vidya-Zentrum, Zaisberg 7, 5201 Seekirchen am Wallersee
  "Dōjō Zen Mon Kō — Zen México": [19.38189, -99.18912], // Ingres 127, Col. Nonoalco, Benito Juárez, CDMX
  "Mokusho Zen Dojo Zagreb": [45.81468, 15.93614], // Ilica 231, 10000 Zagreb
  "Zen-Gruppe Hamburg (Kwan Um Zen Schule)": [53.55095, 9.92779], // Rothestraße 62, 22765 Hamburg-Ottensen
  "Zen-Gruppe Köln (Kwan Um Zen Schule)": [50.97445, 6.95078], // Aikido Centrum Köln, Neusser Str. 478, 50733
  "Frankfurt Zen (Kwan Um)": [50.11816, 8.64192], // Hamburger Allee 96, Hinterhof, 60486 Frankfurt
  "Guelph Zazenkai (White Wind)": [43.56044, -80.24750], // 102–351 Eramosa Road, Guelph ON N1E 2N1
  // The Sufi Temple at 183 Campground Road, Newlands — the group names the
  // venue, but no geocoder resolves that street number, so this is the
  // right road rather than the right door.
  "The Dharma Centre — Cape Town (Newlands)": [-33.97301, 18.47085, "city"],
};

type Cache = Record<string, [number, number] | null>;

/**
 * Committed coordinates, read back from the generated file before it is
 * overwritten.
 *
 * The builder is otherwise NOT idempotent: Nominatim's answers drift, so
 * addresses that resolved when the file was last generated can come back
 * `null` today and silently downgrade a good street-level pin to a town
 * centroid. That is how Bukkoku-ji and Hosshin-ji once collapsed onto a
 * single shared point in Obama. Locking the committed coordinate means a
 * regeneration done for an unrelated reason — a lineage remap, a new
 * country file — cannot move a pin that nobody asked to move.
 *
 * Precedence: MANUAL_COORDS (explicit, source-checked) > lock > geocoder.
 * To move a locked pin, add a MANUAL_COORDS entry; that is the only path
 * that records *why* the coordinate changed.
 */
type GeoPrecision = "exact" | "city";
type ManualCoord = [number, number] | [number, number, GeoPrecision];
interface LockedPin {
  lat: number;
  lng: number;
  geoPrecision: GeoPrecision;
}

interface GeneratedEntry {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  region: string;
  country: string;
  schoolSlug: string;
  sourceId: string;
  sourceExcerpt: string;
  url: string | null;
  practiceDetails?: PracticeDetails;
  geoPrecision: GeoPrecision;
  /** Precision came from an explicit MANUAL_COORDS annotation, so the
   * shared-pin reconciliation below leaves it alone. */
  precisionPinned: boolean;
}

/**
 * Two places cannot occupy one point.
 *
 * When several entries land on the same coordinate it is a town centroid
 * standing in for addresses we do not have, whatever the per-entry evidence
 * suggested — so mark the whole cluster approximate. Co-located sanghas
 * that really do share a hall lose a little precision here; that is the
 * right direction to err, because the alternative is asserting an exact
 * location for a place that is not there.
 *
 * Entries whose precision was pinned by hand in MANUAL_COORDS are left as
 * they are: those coordinates were checked against a source, and some
 * deliberately co-locate (two listings for one Ngong Ping temple).
 */
function reconcileSharedPins(entries: GeneratedEntry[]): number {
  const byCoord = new Map<string, GeneratedEntry[]>();
  for (const e of entries) {
    const key = `${e.lat},${e.lng}`;
    byCoord.set(key, [...(byCoord.get(key) ?? []), e]);
  }
  let downgraded = 0;
  for (const cluster of byCoord.values()) {
    if (cluster.length < 2) continue;
    for (const e of cluster) {
      if (e.precisionPinned || e.geoPrecision === "city") continue;
      e.geoPrecision = "city";
      downgraded++;
    }
  }
  return downgraded;
}

function loadCoordinateLock(): Map<string, LockedPin> {
  const lock = new Map<string, LockedPin>();
  if (!existsSync(OUT_PATH)) return lock;
  const src = readFileSync(OUT_PATH, "utf-8");
  // Split on the emitted entry boundary and read each block on its own, so
  // a malformed or hand-edited block can never bleed into its neighbour the
  // way one big lazy regex would.
  for (const block of src.split(/\n\s{2}\{\n/).slice(1)) {
    const body = block.slice(0, block.indexOf("\n  },"));
    const slug = /slug:\s*"([^"]+)"/.exec(body)?.[1];
    const lat = /\blat:\s*(-?[\d.]+)/.exec(body)?.[1];
    const lng = /\blng:\s*(-?[\d.]+)/.exec(body)?.[1];
    if (!slug || !lat || !lng) continue;
    const precision = /geoPrecision:\s*"(exact|city)"/.exec(body)?.[1];
    lock.set(slug, {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      // Files generated before geoPrecision existed carry no marker. Treat
      // them as "city" only if they share a coordinate with another entry
      // (resolved by the caller, which can see the whole set); default here
      // to "exact" and let that pass refine it.
      geoPrecision: (precision as GeoPrecision) ?? "exact",
    });
  }
  return lock;
}

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

function hasStreetAddress(p: RawPlace): boolean {
  return Boolean(p.address && p.address.length > 5);
}

function buildQueries(p: RawPlace, country: string): string[] {
  const queries: string[] = [];
  // Drop region parentheticals for cleaner queries.
  const cleanRegion = p.region.replace(/\s*\([^)]+\)/g, "").trim();
  // NOTE: a few `address` values already end in their own country, so this
  // emits "…, United Kingdom, United Kingdom", which Nominatim often fails
  // to match. Stripping the duplicate looks like an obvious fix but is not:
  // it changes the cache key for ~66 entries and re-resolves them, which
  // measurably helped some (street-level hits) and hurt others (queries that
  // previously matched now fall back to a bare city centroid — Dhammapada
  // Zen México landed on the Zócalo, and Bukkoku-ji / Hosshin-ji collapsed
  // onto one shared pin). Correct individual pins via MANUAL_COORDS instead,
  // where the coordinate is explicit and can be checked against a source.
  if (hasStreetAddress(p)) {
    queries.push(`${p.address}, ${country}`);
  }
  if (cleanRegion) queries.push(`${p.city}, ${cleanRegion}, ${country}`);
  queries.push(`${p.city}, ${country}`);
  return [...new Set(queries)];
}

/**
 * Decide whether a committed pin is the place itself or a town centroid.
 *
 * Reads the geocode cache rather than the network, so this is free and
 * deterministic. The cache records what each query returned; if the pin
 * matches what the *address* query returned it is the place, and if it
 * matches a later town/region query it is a centroid.
 */
function derivePrecision(
  p: RawPlace,
  country: string,
  cc: string,
  coords: [number, number],
  cache: Cache,
): GeoPrecision {
  const queries = buildQueries(p, country);
  const same = (r: [number, number] | null | undefined) =>
    Boolean(r && r[0] === coords[0] && r[1] === coords[1]);

  for (const [i, q] of queries.entries()) {
    const hit = cache[`${cc}:${q}`];
    if (!same(hit)) continue;
    // Query 0 is the street address only when the listing published one;
    // otherwise the first query is already a town name.
    return i === 0 && hasStreetAddress(p) ? "exact" : "city";
  }
  // No cache entry explains this pin — it came from a hand-verified source
  // (a MANUAL_COORDS entry since removed, or a corrected commit). Trust it
  // if the listing has an address to have been verified against, and treat
  // a bare town name as approximate.
  return hasStreetAddress(p) ? "exact" : "city";
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
  const entries: GeneratedEntry[] = [];
  let kept = 0;
  let skippedDup = 0;
  let skippedCurated = 0;
  let skippedNoCoords = 0;
  let skippedNotZen = 0;
  const excluded: string[] = [];
  const failed: string[] = [];
  const centroidFallbacks: string[] = [];
  const lock = loadCoordinateLock();
  const seenRawNames = new Set<string>();
  const moved: string[] = [];
  let lockedCount = 0;

  console.log(`Loaded ${curatedSlugs.size} curated slugs to protect.`);
  console.log(`Loaded ${lock.size} committed pins to hold steady.`);

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
      seenRawNames.add(p.name);
      const dup = isDuplicate(p.name);
      if (dup) {
        skippedDup++;
        console.log(`  skip (dup of ${dup}): ${p.name}`);
        continue;
      }

      const notZen = notAZenPlace(p.name);
      if (notZen) {
        skippedNotZen++;
        excluded.push(`${cc}: ${p.name} — ${notZen}`);
        console.log(`  skip (not a Zen place): ${p.name}`);
        continue;
      }

      // Slug — parenthetical-stripped name, deduped within batch.
      const baseSlug = STABLE_PLACE_SLUGS[p.name] ?? slugify(nameForSlug(p.name));
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

      // Resolve a pin. Precedence: MANUAL_COORDS (explicit and
      // source-checked) > the committed pin > the geocoder. Anything already
      // committed is held steady so an unrelated rebuild cannot move it —
      // see loadCoordinateLock().
      let coords: [number, number] | null = null;
      let geoPrecision: GeoPrecision = "exact";
      const manual = MANUAL_COORDS[p.name];
      const locked = lock.get(slug);

      if (manual) {
        coords = [manual[0], manual[1]];
        geoPrecision = manual[2] ?? "exact";
        if (
          locked &&
          (locked.lat !== coords[0] || locked.lng !== coords[1])
        ) {
          moved.push(
            `${slug}: [${locked.lat}, ${locked.lng}] → [${coords[0]}, ${coords[1]}] (MANUAL_COORDS)`,
          );
        }
      } else if (locked) {
        coords = [locked.lat, locked.lng];
        // The coordinate is locked; its precision is not. Re-derive it from
        // the geocode cache every run, so files written before the field
        // existed get an honest value and a later address fix upgrades the
        // label without anyone having to remember to.
        geoPrecision = derivePrecision(p, country, cc, coords, cache);
        lockedCount++;
      } else {
        const queries = buildQueries(p, country);
        for (const [i, q] of queries.entries()) {
          coords = await geocodeOne(q, cache, cc);
          if (!coords) continue;
          // Only the first query is the place itself; every later one is a
          // town or region name, so the pin is a centroid rather than the
          // address. Record that as `geoPrecision: "city"` so the map can
          // say so instead of presenting a guess as the temple's location.
          if (i > 0 || !hasStreetAddress(p)) {
            geoPrecision = "city";
            // Publishing a street address that still resolved only at town
            // level is the dangerous case — it lands in the wrong town when
            // the name is ambiguous, which is how StoneWater Zen Kent ended
            // up 33km away in the other Hayes. Surface those for a
            // MANUAL_COORDS fix.
            if (hasStreetAddress(p)) {
              centroidFallbacks.push(`${cc}: ${p.name} — "${p.address}"`);
              console.log(`  ⚠ centroid fallback: ${p.name} (${p.city})`);
            }
          }
          break;
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
      const region = normalizeRegion(p.region, country);
      const canonicalLineage = canonicalizeLineage(p.lineage, schoolSlug);
      const excerptCanonical =
        canonicalLineage === p.lineage
          ? excerpt
          : excerpt.replace(`(${p.lineage})`, `(${canonicalLineage})`);

      entries.push({
        slug,
        name: p.name,
        lat: coords[0],
        lng: coords[1],
        region,
        country,
        schoolSlug,
        sourceId,
        sourceExcerpt: excerptCanonical,
        url: p.url,
        practiceDetails: sourcedPracticeDetails(p.practiceDetails),
        geoPrecision,
        precisionPinned: Boolean(manual),
      });
      kept++;
      console.log(`  ✓ ${slug} [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`);
    }
  }

  const downgraded = reconcileSharedPins(entries);

  const lines = entries.map(
    (e) => `  {
    slug: ${JSON.stringify(e.slug)},
    names: [{ locale: "en", value: ${JSON.stringify(e.name)} }],
    lat: ${e.lat},
    lng: ${e.lng},
    region: ${JSON.stringify(e.region)},
    country: ${JSON.stringify(e.country)},
    foundedYear: null,
    foundedPrecision: null,
    schoolSlug: ${JSON.stringify(e.schoolSlug)},
    status: "active",
    sourceId: ${JSON.stringify(e.sourceId)},
    sourceExcerpt: ${JSON.stringify(e.sourceExcerpt)},${
      // TempleSeed.url is optional, not nullable — a listing with no site
      // of its own omits the field so the popup falls back to the
      // directory that lists it.
      e.url ? `\n    url: ${JSON.stringify(e.url)},` : ""
    }${
      e.practiceDetails ? `\n    practiceDetails: ${JSON.stringify(e.practiceDetails)},` : ""
    }
    geoPrecision: ${JSON.stringify(e.geoPrecision)},
  },`,
  );

  const file = `/**
 * Europe temple seeds — GENERATED by scripts/build-europe-temples.ts.
 * Source: scripts/data/raw/zen-places-*.json. Do not hand-edit; re-run
 * the builder after editing the raw JSON or the lineage→slug mapping.
 *
 * Coordinates are LOCKED: on each run the builder reads the pins already
 * committed here and reuses them, because Nominatim's answers drift and a
 * plain re-run would otherwise downgrade street-level pins to town
 * centroids. To move a pin, add a MANUAL_COORDS entry in the builder —
 * that is the only path that records why it moved.
 *
 * \`geoPrecision\` says what the pin means: "exact" is the place itself,
 * "city" is a town-level centroid standing in for an address we do not
 * have. The map labels the latter as approximate rather than presenting
 * a guess as a temple's location.
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
  console.log(`  held at locked pin: ${lockedCount}`);
  console.log(
    `  exact pins:         ${entries.filter((e) => e.geoPrecision === "exact").length}`,
  );
  console.log(
    `  approximate pins:   ${entries.filter((e) => e.geoPrecision === "city").length} (${downgraded} downgraded for sharing a point)`,
  );
  console.log(`  skipped (curated):  ${skippedCurated}`);
  console.log(`  skipped (pattern):  ${skippedDup}`);
  console.log(`  skipped (not Zen):  ${skippedNotZen}`);
  console.log(`  skipped (geocode):  ${skippedNoCoords}`);
  if (failed.length) {
    console.log(`  failures:`);
    for (const n of failed) console.log(`    - ${n}`);
  }
  if (centroidFallbacks.length) {
    console.log(
      `\n  ⚠ pinned to a city centroid despite having a street address (${centroidFallbacks.length}).`,
    );
    console.log(
      `    These pins are only as precise as the town name — and land in the`,
    );
    console.log(
      `    wrong town when it is ambiguous. Add a MANUAL_COORDS entry for each:`,
    );
    for (const n of centroidFallbacks) console.log(`    - ${n}`);
  }
  // MANUAL_COORDS is keyed on the exact raw `name`. When a raw file renames
  // a place, its override silently stops applying and the hand-verified
  // coordinate quietly reverts to whatever the geocoder says — which is how
  // four Hong Kong corrections went dead when their entries were renamed.
  // The coordinate lock hides this until the generated file is rebuilt from
  // nothing, so surface it every run.
  const unusedManual = Object.keys(MANUAL_COORDS).filter(
    (k) => !seenRawNames.has(k),
  );
  if (unusedManual.length) {
    console.log(
      `\n  ⚠ MANUAL_COORDS keys matching no raw entry (${unusedManual.length}).`,
    );
    console.log(
      `    Each is a hand-verified coordinate that is no longer being applied —`,
    );
    console.log(`    the place was probably renamed. Re-key or delete:`);
    for (const k of unusedManual) console.log(`    - "${k}"`);
  }
  if (moved.length) {
    console.log(
      `\n  ⚑ pins moved off their committed coordinate (${moved.length}).`,
    );
    console.log(
      `    Each is an explicit MANUAL_COORDS decision — check the diff says`,
    );
    console.log(`    what you meant it to say:`);
    for (const n of moved) console.log(`    - ${n}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
