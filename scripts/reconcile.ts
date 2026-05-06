/**
 * Reconciliation Pipeline
 *
 * Merges RawMaster[] records from multiple extraction sources into
 * canonical deduplicated records, resolves teacher references, validates
 * the resulting transmission DAG, and writes five output files.
 *
 * Usage:  npx tsx scripts/reconcile.ts
 *
 * All core functions are exported as pure functions so tests can call them
 * independently.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { generateSearchTokens } from "@/lib/search-tokens";
import { determineSchoolDefinition } from "@/lib/school-taxonomy";
import type { RawMaster, RawTeacherRef } from "./scraper-types";
import { sanitizeRawMasters } from "./raw-master-cleaning";
import { normalizeRawDatasetRows } from "./raw-dataset-config";
import { isReviewedNonMerge } from "./review-decisions";
import { validateDAG, type TransmissionEdge, type MasterDates } from "@/lib/dag-validation";

export type { RawMaster, RawTeacherRef } from "./scraper-types";

// ---------------------------------------------------------------------------
// Canonical output types
// ---------------------------------------------------------------------------

export interface CanonicalName {
  locale: string;
  name_type: string; // 'dharma' | 'birth' | 'honorific' | 'alias'
  value: string;
}

export interface CanonicalMaster {
  id: string;
  slug: string;
  names: CanonicalName[];
  birth_year: number | null;
  birth_precision: string;
  birth_confidence: string;
  death_year: number | null;
  death_precision: string;
  death_confidence: string;
  school: string;
  source_ids: string[];
}

export interface CanonicalTransmission {
  id: string;
  student_id: string;
  teacher_id: string;
  type: "primary" | "secondary" | "disputed" | "dharma";
  is_primary: boolean;
  source_ids: string[];
}

export interface CanonicalCitation {
  id: string;
  source_id: string;
  entity_type: string;
  entity_id: string;
  field_name: string;
  excerpt: string;
}

export interface CanonicalSearchToken {
  id: string;
  entity_type: string;
  entity_id: string;
  token: string;
  original: string;
  locale: string;
  token_type: string;
}

export interface ReviewQueueItem {
  reason: string;
  candidates: RawMaster[];
}

// ---------------------------------------------------------------------------
// Parsed date type
// ---------------------------------------------------------------------------

export interface ParsedDate {
  year: number | null;
  precision: "exact" | "circa" | "decade" | "century" | "unknown";
  confidence: "high" | "medium" | "low" | "disputed";
}

export interface ParsedDates {
  birth: ParsedDate | null;
  death: ParsedDate | null;
}

// ---------------------------------------------------------------------------
// Aliases file type
// ---------------------------------------------------------------------------

interface AliasMap {
  aliases: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Deterministic ID generation
// ---------------------------------------------------------------------------

/**
 * Derive a stable ID from a string by hashing it and taking the first 21
 * characters — matching nanoid's default length while remaining deterministic.
 */
export function deterministicId(seed: string): string {
  const hash = crypto.createHash("sha256").update(seed).digest("base64url");
  return hash.slice(0, 21);
}

/** URL-safe slug from a primary name. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Step 1 — Load raw sources
// ---------------------------------------------------------------------------

export function loadRawSources(rawDir: string): RawMaster[] {
  const all: RawMaster[] = [];

  const filenames = fs
    .readdirSync(rawDir)
    .filter((filename) => filename.endsWith(".json"))
    .sort();

  for (const filename of filenames) {
    const filepath = path.join(rawDir, filename);
    const raw = fs.readFileSync(filepath, "utf-8");
    const parsed: RawMaster[] = JSON.parse(raw);
    all.push(...normalizeRawDatasetRows(filename, parsed));
  }

  return sanitizeRawMasters(all);
}

// ---------------------------------------------------------------------------
// Step 2 — Match and merge
// ---------------------------------------------------------------------------

/**
 * Build a reverse lookup: every alias variant → canonical name.
 * E.g. "Tôzan Ryôkai" → "Dongshan Liangjie"
 */
export function buildAliasLookup(aliasMap: AliasMap): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const [canonical, variants] of Object.entries(aliasMap.aliases)) {
    // Canonical name maps to itself
    lookup.set(canonical.toLowerCase(), canonical);

    for (const variant of variants) {
      lookup.set(variant.toLowerCase(), canonical);
    }
  }

  return lookup;
}

/** Collect every name variant from a RawMaster into a flat array. */
function allNamesOf(m: RawMaster): string[] {
  const names: string[] = [m.name];
  if (m.names_cjk) names.push(m.names_cjk);
  if (m.names_alt) names.push(...m.names_alt);
  if (m.nicknames) names.push(...m.nicknames);
  return names.filter(Boolean);
}

/**
 * Return a canonical name key for a RawMaster given the alias lookup.
 * Priority:
 *   1. Direct canonical lookup of primary name
 *   2. Alias lookup of primary name
 *   3. Alias lookup of any alt name
 *   4. Primary name as-is (lowercased)
 */
export function resolveCanonicalKey(m: RawMaster, aliasLookup: Map<string, string>): string {
  const allNames = allNamesOf(m);

  for (const name of allNames) {
    const found = aliasLookup.get(name.toLowerCase());
    if (found) return found.toLowerCase();
  }

  // Fall back to primary name
  return m.name.toLowerCase();
}

/**
 * Determine whether two RawMasters refer to the same person.
 * Returns the match strategy used or null if no match.
 */
export type MatchStrategy = "cjk" | "name" | "alias" | "date_partial";

export function matchStrategy(
  a: RawMaster,
  b: RawMaster,
  aliasLookup: Map<string, string>
): MatchStrategy | null {
  // 1. Exact CJK match
  if (a.names_cjk && b.names_cjk && a.names_cjk === b.names_cjk) {
    return "cjk";
  }

  // 2. Exact primary name match (case-insensitive)
  if (a.name.toLowerCase() === b.name.toLowerCase()) {
    return "name";
  }

  // 3. Alias lookup — both resolve to the same canonical key
  const keyA = resolveCanonicalKey(a, aliasLookup);
  const keyB = resolveCanonicalKey(b, aliasLookup);
  if (keyA === keyB) {
    return "alias";
  }

  // 4. Date + partial name match
  const datesA = parseDates(a.dates);
  const datesB = parseDates(b.dates);

  if (datesOverlap(datesA, datesB)) {
    const namesA = allNamesOf(a).map((n) => n.toLowerCase());
    const namesB = allNamesOf(b).map((n) => n.toLowerCase());

    // Check if any name token from A appears in any name from B (or vice versa)
    const tokensA = namesA.flatMap((n) => n.split(/\s+/));
    const tokensB = new Set(namesB.flatMap((n) => n.split(/\s+/)));

    const overlap = tokensA.filter((t) => t.length > 2 && tokensB.has(t));
    if (overlap.length > 0) {
      return "date_partial";
    }
  }

  return null;
}

/** Check whether two parsed date structs have plausibly overlapping lifespans. */
function datesOverlap(a: ParsedDates, b: ParsedDates): boolean {
  // Both must have at least one real year
  const yearsA = [a.birth?.year, a.death?.year].filter(
    (y): y is number => y !== null && y !== undefined
  );
  const yearsB = [b.birth?.year, b.death?.year].filter(
    (y): y is number => y !== null && y !== undefined
  );

  if (yearsA.length === 0 || yearsB.length === 0) return false;

  // Build rough lifespan ranges
  const aMin = Math.min(...yearsA) - 10;
  const aMax = Math.max(...yearsA) + 10;
  const bMin = Math.min(...yearsB) - 10;
  const bMax = Math.max(...yearsB) + 10;

  return aMin <= bMax && bMin <= aMax;
}

/**
 * Merge two RawMasters into a single record, preferring the more reliable source.
 * Source reliability order (highest first): scholarly > secondary > popular
 */
const SOURCE_RELIABILITY: Record<string, number> = {
  src_sotozen_founders: 5,
  src_chan_ancestors_pdf: 4,
  src_tibetan_encyclopedia: 3,
  src_terebess: 3,
  src_mountain_moon: 3,
  src_originals_curated: 2,
  src_wikipedia: 2,
};

function reliabilityOf(sourceId: string): number {
  return SOURCE_RELIABILITY[sourceId] ?? 1;
}

export function mergeMasters(a: RawMaster, b: RawMaster): RawMaster {
  const primary = reliabilityOf(a.source_id) >= reliabilityOf(b.source_id) ? a : b;
  const secondary = primary === a ? b : a;

  // Merge alt names, deduplicating
  const altNames = new Set([...(a.names_alt ?? []), ...(b.names_alt ?? [])]);
  // Cross-add primary names as alts
  if (secondary.name !== primary.name) altNames.add(secondary.name);
  // Remove the winner's primary name from alts
  altNames.delete(primary.name);

  // Merge nicknames
  const nicknames = Array.from(new Set([...(a.nicknames ?? []), ...(b.nicknames ?? [])]));
  const koanRefs = Array.from(new Set([a.koan_refs, b.koan_refs].filter(Boolean))).join(" | ");

  // Merge teachers
  const teacherMap = new Map<string, RawTeacherRef>();
  for (const t of [...a.teachers, ...b.teachers]) {
    const key = t.name.toLowerCase();
    if (!teacherMap.has(key)) {
      teacherMap.set(key, t);
    } else {
      // Prefer the one from the more reliable source
      const existing = teacherMap.get(key)!;
      const fromA = a.teachers.includes(t);
      const preferNew = fromA
        ? reliabilityOf(a.source_id) > reliabilityOf(b.source_id)
        : reliabilityOf(b.source_id) > reliabilityOf(a.source_id);
      if (preferNew) teacherMap.set(key, t);
      else {
        // Merge edge_type if they differ — prefer primary > secondary > disputed
        const edgePriority: Record<string, number> = { primary: 3, dharma: 2, secondary: 2, disputed: 1 };
        const existingPriority = edgePriority[existing.edge_type ?? "secondary"] ?? 2;
        const newPriority = edgePriority[t.edge_type ?? "secondary"] ?? 2;
        if (newPriority > existingPriority) teacherMap.set(key, t);
      }
    }
  }

  return {
    ...primary,
    names_cjk: primary.names_cjk || secondary.names_cjk,
    names_alt: Array.from(altNames),
    nicknames: nicknames.length > 0 ? nicknames : undefined,
    koan_refs: koanRefs || undefined,
    teachers: Array.from(teacherMap.values()),
    // Keep both source IDs encoded in ingestion_run_id field is not appropriate;
    // we track source_ids at the CanonicalMaster level instead.
  };
}

// ---------------------------------------------------------------------------
// Step 3 — Date parsing
// ---------------------------------------------------------------------------

/**
 * Expand an abbreviated year given the century of the anchor year.
 * E.g. anchor=807, abbreviated=69  → 869
 *      anchor=1025, abbreviated=72 → 1072
 */
export function expandAbbreviatedYear(anchor: number, abbrev: number): number {
  const century = Math.floor(anchor / 100) * 100;
  const candidate = century + abbrev;
  // If abbreviated year is less than anchor's last two digits,
  // the century has rolled over (e.g. 807-69 means 869, not 769)
  if (candidate < anchor) return century + 100 + abbrev;
  return candidate;
}

/**
 * Parse a raw date string into structured birth/death dates.
 *
 * Handled formats:
 *   "487-593"       → birth 487 exact/high, death 593 exact/high
 *   "807-69"        → birth 807 exact/high, death 869 exact/high
 *   "d. 536? C.E."  → death 536 circa/medium
 *   "d. 606"        → death 606 exact/high
 *   "d. 9th c."     → death ~850 century/low
 *   "n.d."          → null
 *   "c. 500"        → birth ~500 circa/medium
 *   "fl. 800"       → birth ~800 circa/low
 */
export function parseDates(raw: string): ParsedDates {
  const s = raw.trim();

  if (!s || s === "n.d." || s === "n.d") {
    return { birth: null, death: null };
  }

  // "d. NNN? C.E." or "d. NNN? C.E"
  const dCE = s.match(/^d\.\s*(\d+)\?\s*C\.?E\.?$/i);
  if (dCE) {
    return {
      birth: null,
      death: { year: parseInt(dCE[1], 10), precision: "circa", confidence: "medium" },
    };
  }

  // "d. NNNth c." / "d. NNth c." — ordinal century
  const dCentury = s.match(/^d\.\s*(\d+)(?:th|st|nd|rd)\s*c\.?$/i);
  if (dCentury) {
    const centuryNum = parseInt(dCentury[1], 10);
    const midpoint = (centuryNum - 1) * 100 + 50;
    return {
      birth: null,
      death: { year: midpoint, precision: "century", confidence: "low" },
    };
  }

  // "d. NNN"
  const dPlain = s.match(/^d\.\s*(\d+)$/);
  if (dPlain) {
    return {
      birth: null,
      death: { year: parseInt(dPlain[1], 10), precision: "exact", confidence: "high" },
    };
  }

  // "fl. NNN" — flourished
  const fl = s.match(/^fl\.\s*(\d+)$/i);
  if (fl) {
    return {
      birth: { year: parseInt(fl[1], 10), precision: "circa", confidence: "low" },
      death: null,
    };
  }

  // "c. NNN-NNN BCE" — circa BCE range
  const circaBCERange = s.match(/^c\.\s*(\d+)-(\d+)\s*BCE$/i);
  if (circaBCERange) {
    return {
      birth: { year: -parseInt(circaBCERange[1], 10), precision: "circa", confidence: "medium" },
      death: { year: -parseInt(circaBCERange[2], 10), precision: "circa", confidence: "medium" },
    };
  }

  // "NNN-NNN BCE" — exact BCE range
  const exactBCERange = s.match(/^(\d+)-(\d+)\s*BCE$/i);
  if (exactBCERange) {
    return {
      birth: { year: -parseInt(exactBCERange[1], 10), precision: "exact", confidence: "high" },
      death: { year: -parseInt(exactBCERange[2], 10), precision: "exact", confidence: "high" },
    };
  }

  // "c. NNN-NNN CE" or "c. NNN-NNN" — circa CE/implicit range
  const circaCERange = s.match(/^c\.\s*(\d+)-(\d+)(?:\s*CE)?$/i);
  if (circaCERange) {
    return {
      birth: { year: parseInt(circaCERange[1], 10), precision: "circa", confidence: "medium" },
      death: { year: parseInt(circaCERange[2], 10), precision: "circa", confidence: "medium" },
    };
  }

  // "d. NNN BCE" — exact BCE death
  const dBCE = s.match(/^d\.\s*(\d+)\s*BCE$/i);
  if (dBCE) {
    return {
      birth: null,
      death: { year: -parseInt(dBCE[1], 10), precision: "exact", confidence: "high" },
    };
  }

  // "fl. Nth c. BCE" — flourished BCE century
  const flBCECentury = s.match(/^fl\.\s*(\d+)(?:th|st|nd|rd)\s*c\.?\s*BCE$/i);
  if (flBCECentury) {
    const centuryNum = parseInt(flBCECentury[1], 10);
    const midpoint = -((centuryNum - 1) * 100 + 50);
    return {
      birth: { year: midpoint, precision: "century", confidence: "low" },
      death: null,
    };
  }

  // "c. Nth c. BCE" or "trad. Nth c. BCE" — circa/traditional BCE century
  const circaBCECentury = s.match(/^(?:c\.|trad\.)\s*(\d+)(?:th|st|nd|rd)\s*c\.?\s*BCE$/i);
  if (circaBCECentury) {
    const centuryNum = parseInt(circaBCECentury[1], 10);
    const midpoint = -((centuryNum - 1) * 100 + 50);
    return {
      birth: { year: midpoint, precision: "century", confidence: "low" },
      death: null,
    };
  }

  // "c. Nth c. CE" or "trad. Nth c. CE" — circa/traditional CE century
  const circaCECentury = s.match(/^(?:c\.|trad\.)\s*(\d+)(?:th|st|nd|rd)\s*c\.?\s*(?:CE)?$/i);
  if (circaCECentury) {
    const centuryNum = parseInt(circaCECentury[1], 10);
    const midpoint = (centuryNum - 1) * 100 + 50;
    return {
      birth: { year: midpoint, precision: "century", confidence: "low" },
      death: null,
    };
  }

  // "Nth-Nth c. CE" or "Nth-Nth c." — century range
  const centuryRange = s.match(/^(\d+)(?:th|st|nd|rd)-(\d+)(?:th|st|nd|rd)\s*c\.?(?:\s*CE)?$/i);
  if (centuryRange) {
    const birthCentury = parseInt(centuryRange[1], 10);
    const deathCentury = parseInt(centuryRange[2], 10);
    return {
      birth: { year: (birthCentury - 1) * 100 + 50, precision: "century", confidence: "low" },
      death: { year: (deathCentury - 1) * 100 + 50, precision: "century", confidence: "low" },
    };
  }

  // "c. NNN"
  const circa = s.match(/^c\.\s*(\d+)$/i);
  if (circa) {
    return {
      birth: { year: parseInt(circa[1], 10), precision: "circa", confidence: "medium" },
      death: null,
    };
  }

  // "BIRTH-DEATH" or "BIRTH-ABBREV"
  const range = s.match(/^(\d{3,4})-(\d{2,4})$/);
  if (range) {
    const birthYear = parseInt(range[1], 10);
    const rawDeath = parseInt(range[2], 10);

    // Expand abbreviated death year (e.g. 807-69 → 869)
    const deathYear = rawDeath < 100 ? expandAbbreviatedYear(birthYear, rawDeath) : rawDeath;

    return {
      birth: { year: birthYear, precision: "exact", confidence: "high" },
      death: { year: deathYear, precision: "exact", confidence: "high" },
    };
  }

  // "BIRTH-" — still living, open-ended death year (e.g. "1950-")
  const livingRange = s.match(/^(\d{3,4})-$/);
  if (livingRange) {
    return {
      birth: { year: parseInt(livingRange[1], 10), precision: "exact", confidence: "high" },
      death: null,
    };
  }

  // Fallback — unknown
  return { birth: null, death: null };
}

// ---------------------------------------------------------------------------
// Merge group of RawMasters into a CanonicalMaster
// ---------------------------------------------------------------------------

function inferLocale(value: string): string {
  // CJK block
  if (/[\u4e00-\u9fff]/.test(value)) return "zh";
  // Kana
  if (/[\u3040-\u30ff]/.test(value)) return "ja";
  return "en";
}

/**
 * Build the canonical names array for a merged group of RawMasters.
 * Deduplicates by value.
 */
export function buildCanonicalNames(
  group: RawMaster[],
  aliasLookup: Map<string, string>
): CanonicalName[] {
  const seen = new Set<string>();
  const names: CanonicalName[] = [];

  function addName(value: string, nameType: string) {
    if (!value || seen.has(value)) return;
    seen.add(value);
    names.push({ locale: inferLocale(value), name_type: nameType, value });
  }

  // Primary name from highest-reliability source first
  const sorted = [...group].sort((a, b) => reliabilityOf(b.source_id) - reliabilityOf(a.source_id));

  const primary = sorted[0];

  // If aliases.json marks a different canonical name (e.g. Ferguson's Pinyin
  // "Puti Damo" maps to canonical "Bodhidharma"), let the alias file win as
  // the dharma name. Source-form becomes an alias.
  const aliasCanonical = aliasLookup.get(primary.name.toLowerCase());
  const dharmaName = aliasCanonical ?? primary.name;
  addName(dharmaName, "dharma");

  for (const m of sorted) {
    if (m.name !== dharmaName) addName(m.name, "alias");
    if (m.names_cjk) addName(m.names_cjk, "alias");
    for (const alt of m.names_alt ?? []) addName(alt, "alias");
    for (const nick of m.nicknames ?? []) addName(nick, "honorific");
  }

  // Add alias-file variants for the canonical name
  for (const [canon, variants] of Object.entries(
    buildCanonicalNamesFromAliasFile(aliasLookup, primary.name)
  )) {
    addName(canon, "dharma");
    for (const v of variants) addName(v, "alias");
  }

  return names;
}

/** Pull alias-file entries that apply to this master. */
function buildCanonicalNamesFromAliasFile(
  aliasLookup: Map<string, string>,
  primaryName: string
): Record<string, string[]> {
  // Find the canonical name this primary resolves to
  const canon = aliasLookup.get(primaryName.toLowerCase());
  if (!canon) return {};

  // Collect all variants that map to the same canonical
  const variants: string[] = [];
  for (const [variant, c] of aliasLookup.entries()) {
    if (c.toLowerCase() === canon.toLowerCase() && variant !== canon.toLowerCase()) {
      // Restore original casing — we stored lower, so use the value directly
      // (we only have lowercased keys; we'll trust the variant is its original form)
      variants.push(variant);
    }
  }

  return { [canon]: variants };
}

/**
 * Merge a group of RawMasters that all refer to the same person
 * into a single CanonicalMaster.
 */
export function buildCanonicalMaster(
  group: RawMaster[],
  aliasLookup: Map<string, string>
): CanonicalMaster {
  if (group.length === 0) throw new Error("empty group");

  const sorted = [...group].sort((a, b) => reliabilityOf(b.source_id) - reliabilityOf(a.source_id));
  const primary = sorted[0];

  // Parse dates — pick the non-null ones from most reliable source
  let dates: ParsedDates = { birth: null, death: null };
  for (const m of sorted) {
    const d = parseDates(m.dates);
    if (!dates.birth && d.birth) dates = { ...dates, birth: d.birth };
    if (!dates.death && d.death) dates = { ...dates, death: d.death };
    if (dates.birth && dates.death) break;
  }

  const sourceIds = Array.from(new Set(group.map((m) => m.source_id)));

  // Deterministic ID from primary name (stable across runs)
  const id = deterministicId(`master:${primary.name.toLowerCase()}`);
  const slug = slugify(primary.name);

  const names = buildCanonicalNames(group, aliasLookup);
  const schoolDefinition = determineSchoolDefinition({
    rawLabel: primary.school,
    names: names.map((name) => name.value),
  });

  return {
    id,
    slug,
    names,
    birth_year: dates.birth?.year ?? null,
    birth_precision: dates.birth?.precision ?? "unknown",
    birth_confidence: dates.birth?.confidence ?? "low",
    death_year: dates.death?.year ?? null,
    death_precision: dates.death?.precision ?? "unknown",
    death_confidence: dates.death?.confidence ?? "low",
    school: schoolDefinition?.name ?? primary.school,
    source_ids: sourceIds,
  };
}

// ---------------------------------------------------------------------------
// Step 4 — Search tokens
// ---------------------------------------------------------------------------

export function buildSearchTokens(masters: CanonicalMaster[]): CanonicalSearchToken[] {
  const tokens: CanonicalSearchToken[] = [];

  for (const master of masters) {
    for (const name of master.names) {
      const raw = generateSearchTokens({
        value: name.value,
        locale: name.locale,
        nameType: name.name_type,
      });

      for (const tok of raw) {
        tokens.push({
          id: deterministicId(`token:${master.id}:${tok.token}:${tok.tokenType}`),
          entity_type: "master",
          entity_id: master.id,
          token: tok.token,
          original: tok.original,
          locale: tok.locale,
          token_type: tok.tokenType,
        });
      }
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Step 5 — Citations
// ---------------------------------------------------------------------------

export function buildCitations(
  masters: CanonicalMaster[],
  groups: Map<string, RawMaster[]>
): CanonicalCitation[] {
  const citations: CanonicalCitation[] = [];

  for (const master of masters) {
    const group = groups.get(master.id) ?? [];

    for (const raw of group) {
      // One citation per source per master for the date field
      if (raw.dates) {
        citations.push({
          id: deterministicId(`cite:${master.id}:${raw.source_id}:dates`),
          source_id: raw.source_id,
          entity_type: "master",
          entity_id: master.id,
          field_name: "dates",
          excerpt: raw.dates,
        });
      }

      // Citation for the name
      citations.push({
        id: deterministicId(`cite:${master.id}:${raw.source_id}:name`),
        source_id: raw.source_id,
        entity_type: "master",
        entity_id: master.id,
        field_name: "name",
        excerpt: raw.name,
      });

      if (raw.school) {
        citations.push({
          id: deterministicId(`cite:${master.id}:${raw.source_id}:school:${raw.school}`),
          source_id: raw.source_id,
          entity_type: "master",
          entity_id: master.id,
          field_name: "school",
          excerpt: raw.school,
        });
      }

      for (const teacher of raw.teachers) {
        citations.push({
          id: deterministicId(
            `cite:${master.id}:${raw.source_id}:teacher:${teacher.name}:${teacher.locator ?? ""}`
          ),
          source_id: raw.source_id,
          entity_type: "master",
          entity_id: master.id,
          field_name: "teachers",
          excerpt: teacher.locator ? `${teacher.name} (${teacher.locator})` : teacher.name,
        });
      }

      if (raw.koan_refs) {
        citations.push({
          id: deterministicId(`cite:${master.id}:${raw.source_id}:koan_refs:${raw.koan_refs}`),
          source_id: raw.source_id,
          entity_type: "master",
          entity_id: master.id,
          field_name: "koan_refs",
          excerpt: raw.koan_refs,
        });
      }
    }
  }

  return citations;
}

// ---------------------------------------------------------------------------
// Step 6 — Transmission edges
// ---------------------------------------------------------------------------

/**
 * Resolve a raw teacher name string to a canonical master ID.
 * Returns null if the teacher can't be found.
 */
export function resolveTeacherRef(
  teacherName: string,
  canonicalById: Map<string, CanonicalMaster>,
  slugToId: Map<string, string>,
  aliasLookup: Map<string, string>
): string | null {
  const lowerName = teacherName.toLowerCase();

  // 1. Exact slug match
  const slugKey = slugify(teacherName);
  if (slugToId.has(slugKey)) return slugToId.get(slugKey)!;

  // 2. Alias lookup → canonical name → slug
  const canonicalName = aliasLookup.get(lowerName);
  if (canonicalName) {
    const canonSlug = slugify(canonicalName);
    if (slugToId.has(canonSlug)) return slugToId.get(canonSlug)!;
  }

  // 3. Scan all masters for any matching name value
  for (const master of canonicalById.values()) {
    for (const n of master.names) {
      if (n.value.toLowerCase() === lowerName) return master.id;
    }
  }

  return null;
}

export function buildTransmissions(
  groups: Map<string, RawMaster[]>,
  canonicalById: Map<string, CanonicalMaster>,
  aliasLookup: Map<string, string>
): CanonicalTransmission[] {
  // Build slug→id lookup
  const slugToId = new Map<string, string>();
  for (const master of canonicalById.values()) {
    slugToId.set(master.slug, master.id);
  }

  // Deduplicate edges by student+teacher pair
  const edgeMap = new Map<string, { edge: CanonicalTransmission; sourceIds: Set<string> }>();

  for (const [masterId, rawMasters] of groups) {
    for (const raw of rawMasters) {
      for (const ref of raw.teachers) {
        const teacherId = resolveTeacherRef(ref.name, canonicalById, slugToId, aliasLookup);

        if (!teacherId) continue; // unresolvable — skip

        const type: "primary" | "secondary" | "disputed" | "dharma" = ref.edge_type ?? "primary";
        const pairKey = `${masterId}:${teacherId}`;

        if (!edgeMap.has(pairKey)) {
          edgeMap.set(pairKey, {
            edge: {
              id: deterministicId(`tx:${masterId}:${teacherId}`),
              student_id: masterId,
              teacher_id: teacherId,
              type,
              is_primary: type === "primary",
              source_ids: [],
            },
            sourceIds: new Set(),
          });
        }

        edgeMap.get(pairKey)!.sourceIds.add(raw.source_id);
      }
    }
  }

  // Finalise edges with source IDs
  return Array.from(edgeMap.values()).map(({ edge, sourceIds }) => ({
    ...edge,
    source_ids: Array.from(sourceIds),
  }));
}

// ---------------------------------------------------------------------------
// Step 7 — DAG validation
// ---------------------------------------------------------------------------

export function toTransmissionEdge(t: CanonicalTransmission): TransmissionEdge {
  return {
    id: t.id,
    studentId: t.student_id,
    teacherId: t.teacher_id,
    type: t.type,
    isPrimary: t.is_primary,
  };
}

export function toMasterDates(m: CanonicalMaster): MasterDates {
  return {
    id: m.id,
    birthYear: m.birth_year,
    birthPrecision: m.birth_precision,
    birthConfidence: m.birth_confidence,
    deathYear: m.death_year,
    deathPrecision: m.death_precision,
    deathConfidence: m.death_confidence,
  };
}

// ---------------------------------------------------------------------------
// Core reconciliation function (pure — no I/O)
// ---------------------------------------------------------------------------

export interface ReconcileResult {
  masters: CanonicalMaster[];
  transmissions: CanonicalTransmission[];
  citations: CanonicalCitation[];
  searchTokens: CanonicalSearchToken[];
  reviewQueue: ReviewQueueItem[];
  dagResult: ReturnType<typeof validateDAG>;
}

export function reconcile(rawMasters: RawMaster[], aliasMap: AliasMap): ReconcileResult {
  const aliasLookup = buildAliasLookup(aliasMap);

  // ---- Group raw masters by canonical key ----
  // We build groups iteratively: for each raw master, find its group key
  // and collect all members.
  const groupsByKey = new Map<string, RawMaster[]>();

  for (const raw of rawMasters) {
    const key = resolveCanonicalKey(raw, aliasLookup);
    if (!groupsByKey.has(key)) groupsByKey.set(key, []);
    groupsByKey.get(key)!.push(raw);
  }

  // ---- Detect ambiguous date+partial matches across groups ----
  // For each pair of groups that might be the same person (date_partial),
  // send them to the review queue instead of merging.
  const reviewQueue: ReviewQueueItem[] = [];
  const mergedGroupsByKey = new Map<string, RawMaster[]>(groupsByKey);

  const keys = Array.from(mergedGroupsByKey.keys());
  const toMerge = new Map<string, string>(); // smaller key → larger key

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const keyA = keys[i];
      const keyB = keys[j];
      if (toMerge.has(keyA) || toMerge.has(keyB)) continue;

      const groupA = mergedGroupsByKey.get(keyA)!;
      const groupB = mergedGroupsByKey.get(keyB)!;

      // Pick a representative from each group
      const repA = groupA[0];
      const repB = groupB[0];

      const strategy = matchStrategy(repA, repB, aliasLookup);

      if (strategy === "date_partial") {
        if (isReviewedNonMerge(repA.name, repB.name)) {
          continue;
        }
        // Ambiguous — send to review queue
        reviewQueue.push({
          reason: `Potential match via date+partial-name between "${repA.name}" and "${repB.name}"`,
          candidates: [...groupA, ...groupB],
        });
      }
    }
  }

  // ---- Build canonical masters ----
  const canonicalMasters: CanonicalMaster[] = [];
  const groupsByMasterId = new Map<string, RawMaster[]>();

  for (const [, group] of mergedGroupsByKey) {
    const master = buildCanonicalMaster(group, aliasLookup);
    canonicalMasters.push(master);
    groupsByMasterId.set(master.id, group);
  }

  // ---- Sort for deterministic output ----
  canonicalMasters.sort((a, b) => a.id.localeCompare(b.id));

  // ---- Build lookup maps ----
  const canonicalById = new Map<string, CanonicalMaster>(canonicalMasters.map((m) => [m.id, m]));

  // ---- Build transmissions ----
  const transmissions = buildTransmissions(groupsByMasterId, canonicalById, aliasLookup);

  // ---- Build citations ----
  const citations = buildCitations(canonicalMasters, groupsByMasterId);

  // ---- Build search tokens ----
  const searchTokens = buildSearchTokens(canonicalMasters);

  // ---- DAG validation ----
  const dagEdges = transmissions.map(toTransmissionEdge);
  const dagMasters = canonicalMasters.map(toMasterDates);
  const masterIds = canonicalMasters.map((m) => m.id);
  const dagResult = validateDAG(dagEdges, dagMasters, masterIds);

  return {
    masters: canonicalMasters,
    transmissions,
    citations,
    searchTokens,
    reviewQueue,
    dagResult,
  };
}

// ---------------------------------------------------------------------------
// Step 8 — Output (I/O wrapper)
// ---------------------------------------------------------------------------

export function writeOutputs(result: ReconcileResult, outDir: string): void {
  fs.mkdirSync(outDir, { recursive: true });

  const write = (filename: string, data: unknown) => {
    fs.writeFileSync(path.join(outDir, filename), JSON.stringify(data, null, 2), "utf-8");
  };

  write("canonical.json", result.masters);
  write("transmissions.json", result.transmissions);
  write("citations.json", result.citations);
  write("search-tokens.json", result.searchTokens);

  // Review queue goes one level up
  const reviewPath = path.join(outDir, "..", "review-queue.json");
  fs.writeFileSync(reviewPath, JSON.stringify(result.reviewQueue, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Main (CLI entry point)
// ---------------------------------------------------------------------------

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.url?.replace("file://", "") ?? "")
) {
  const rawDir = path.join(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "data",
    "raw"
  );
  const outDir = path.join(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "data",
    "reconciled"
  );
  const aliasPath = path.join(
    import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
    "data",
    "aliases.json"
  );

  console.log("Loading raw sources…");
  const rawMasters = loadRawSources(rawDir);
  console.log(`  Loaded ${rawMasters.length} raw masters from ${rawDir}`);

  const aliasMap: AliasMap = JSON.parse(fs.readFileSync(aliasPath, "utf-8"));

  console.log("Reconciling…");
  const result = reconcile(rawMasters, aliasMap);

  console.log(`  ${result.masters.length} canonical masters`);
  console.log(`  ${result.transmissions.length} transmission edges`);
  console.log(`  ${result.citations.length} citations`);
  console.log(`  ${result.searchTokens.length} search tokens`);
  console.log(`  ${result.reviewQueue.length} items in review queue`);

  if (!result.dagResult.valid) {
    console.warn(`  DAG errors: ${result.dagResult.errors.length}`);
    for (const e of result.dagResult.errors) {
      console.warn(`    [${e.type}] ${e.message}`);
    }
  }
  if (result.dagResult.warnings.length > 0) {
    console.warn(`  DAG warnings: ${result.dagResult.warnings.length}`);
  }

  writeOutputs(result, outDir);
  console.log(`\nOutputs written to ${outDir}`);
}
