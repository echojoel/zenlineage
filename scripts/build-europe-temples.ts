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
  /** The place's own site. Null when it publishes none — several sanghas
   * are listed only through a directory or a contact email. */
  url: string | null;
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
// Keyed by the raw `name` field. Values are [lat, lng] — or
// [lat, lng, precision] when the coordinate is deliberately approximate
// (a national network with no single site, a retreat whose location the
// community does not publish). Omitting the third element means "exact":
// this pin is the place itself, verified against a named source.
const MANUAL_COORDS: Record<string, ManualCoord> = {
  "Jikishoan Zen Buddhist Community": [-37.7434, 144.9988], // Preston VIC 3072
  "Melbourne Zen Group": [-37.7589, 144.9876], // CERES Environment Park, Brunswick East
  "Centrum Oko Lesa (Sandō Kaisen — retreat)": [49.8175, 15.473, "city"], // Czech centroid (rural retreat, exact loc not public)
  "Europäisches Zentrum für Meditation und Begegnung Neumühle": [49.4756, 6.5697], // Mettlach-Tünsdorf 66693
  "Sangha Aman à Breman (Plougiel)": [48.7833, -3.2667], // Plougiel, Côtes-d'Armor
  "Shawbottom Farm Retreat": [52.45, -2.75, "city"], // Shropshire approx (WCF retreat venue)
  "Po Lin Monastery (Po Lin Chansi)": [22.2548, 113.9051], // Ngong Ping plateau, Lantau
  "Lotus Pond Temple (Plum Village Hong Kong, Asian Institute of Applied Buddhism)": [22.2553, 113.905], // Ngong Ping, Lantau
  "Su Bong Zen Monastery": [22.2780, 114.1841], // Causeway Bay, Leighton Rd
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
  "Pu Men Temple Hong Kong (Foguangshan)": [22.2757, 114.173], // Wan Chai
  "Chi Lin Nunnery": [22.3408, 114.2025], // Diamond Hill, Kowloon
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
  "Guoqing Temple": [29.173141, 121.042594], // 国清寺, Mount Tiantai
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
  "Chùa Thiên Mụ (Linh Mụ)": [16.453599, 107.544812], // Đồi Hà Khê, Hương Long
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
  "Comunidad Zen de los Andes": [4.704874, -74.126102], // Carrera 107C at ~#142, Engativá, Bogotá
  // Ama Samy's newer foundation shares the hill village of Perumalmalai
  // with Bodhi Zendo; the village, not the building, is what is knowable
  // from published sources, so this pin says so.
  "Kanzeon Zendo": [10.265243, 77.547472, "city"], // Perumalmalai, Kodaikanal 624101
  // Five Trúc Lâm monasteries in Phước Thái, Đồng Nai were stacked on one
  // provincial centroid. OSM has nodes for two of them; the rest keep a
  // town-level pin, which the map now labels as approximate.
  "Thiền viện Thường Chiếu": [10.684166, 107.026441], // Ấp 1C, Xã Phước Thái
  "Thiền viện Linh Chiếu": [10.685185, 107.024108], // Hiền Đức, Xã Phước Thái
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
          if (i > 0) {
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
