/**
 * Accuracy audit: surface field-level and attribution gaps that threaten
 * factual correctness of the site. Complements check-exit-criteria.ts,
 * which focuses on coverage (counts). This script focuses on whether what
 * we publish is (a) cited, (b) marked with the right uncertainty, and
 * (c) attributed honestly.
 *
 * Outputs two files in reports/:
 *   - accuracy-report.md  (human digest, reviewable in PRs)
 *   - accuracy-report.csv (one row per issue, for tracking / dashboards)
 *
 * Usage:
 *   DATABASE_URL=file:zen.db npx tsx scripts/audit-accuracy.ts
 *
 * Exit code:
 *   0 if no CRITICAL issues, 1 otherwise. CI should gate on this.
 */

import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masterTransmissions,
  masters,
  schools,
  sources,
  teachingContent,
  teachingMasterRoles,
  teachings,
} from "@/db/schema";
import { isTier1Master } from "@/lib/editorial-tiers";

// ---------------------------------------------------------------------------
// Severity and issue model
// ---------------------------------------------------------------------------

type Severity = "CRITICAL" | "WARNING" | "INFO";

interface Issue {
  severity: Severity;
  category: string;
  entityType: string;
  entityId: string;
  entitySlug: string;
  field?: string;
  tier?: "tier1" | "other";
  detail: string;
}

// ---------------------------------------------------------------------------
// Taxonomy helpers for romanization / native-script expectations
// ---------------------------------------------------------------------------

// Each school slug maps to the set of scripts we expect at least one name to
// be written in. We check for script *presence* (Unicode range match) rather
// than for a specific locale tag, because the dataset uses zh for CJK-kanji
// even when the person is Japanese — that's a separate locale-tagging issue.
// A master of a Soto/Rinzai/Obaku school without any kanji name is a real
// native-script gap; with kanji present, the native-script requirement is met
// regardless of whether it's tagged ja or zh.

type Script =
  | "cjk" // CJK unified ideographs + kana — covers zh / ja / ko-hanja
  | "hangul" // Korean hangul
  | "vietnamese" // Latin with tone marks used by Vietnamese
  | "devanagari"; // Sanskrit / Hindi

const SCRIPT_RANGES: Record<Script, RegExp> = {
  // CJK Unified Ideographs, Extension A, Hiragana, Katakana, CJK compat
  cjk: /[぀-ヿ㐀-䶿一-鿿豈-﫿]/,
  // Hangul syllables + Jamo
  hangul: /[ᄀ-ᇿ㄰-㆏가-힯]/,
  // Vietnamese tone marks — any Latin letter with combining mark from the
  // Vietnamese set. We use a pragmatic class of precomposed Vietnamese
  // characters (a subset of Latin Extended-A/B + Combining Diacritical
  // Marks). A name with at least one is Vietnamese-script.
  vietnamese: /[ạảãáàăằắẳẵặâầấẩẫậđẹẻẽéèêềếểễệịỉíìọỏõóòôồốổỗộơờớởỡợụủũúùưừứửữựỳýỷỹỵÁÀẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÉÈẺẼẸÊỀẾỂỄỆÍÌỈĨỊÓÒỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÚÙỦŨỤƯỪỨỬỮỰÝỲỶỸỴ]/,
  devanagari: /[ऀ-ॿ]/,
};

function detectScripts(value: string): Set<Script> {
  const found = new Set<Script>();
  for (const key of Object.keys(SCRIPT_RANGES) as Script[]) {
    if (SCRIPT_RANGES[key].test(value)) found.add(key);
  }
  return found;
}

const EXPECTED_SCRIPTS_BY_SCHOOL: Record<string, readonly Script[]> = {
  // Indian lineage — Sanskrit (Devanagari) is the primary native script,
  // though we accept its absence more gently since many patriarchs are
  // known only via later Chinese sources.
  "indian-patriarchs": ["devanagari"],

  // Chinese schools — CJK ideographs required.
  chan: ["cjk"],
  "early-chan": ["cjk"],
  "qingyuan-line": ["cjk"],
  "nanyue-line": ["cjk"],
  caodong: ["cjk"],
  linji: ["cjk"],
  yunmen: ["cjk"],
  fayan: ["cjk"],
  guiyang: ["cjk"],
  "yangqi-line": ["cjk"],

  // Japanese schools — kanji/kana (all in the cjk range).
  soto: ["cjk"],
  rinzai: ["cjk"],
  obaku: ["cjk"],
  "sanbo-zen": ["cjk"],

  // Korean schools — hangul preferred, but hanja (cjk range) is the
  // traditional orthography and acceptable here. At least one of the two.
  seon: ["hangul", "cjk"],
  jogye: ["hangul", "cjk"],
  "kwan-um": ["hangul", "cjk"],
  "taego-order": ["hangul", "cjk"],

  // Vietnamese — tone-marked Latin (the modern orthography).
  thien: ["vietnamese"],
  "lam-te": ["vietnamese"],
  "truc-lam": ["vietnamese"],
  "plum-village": ["vietnamese"],
};

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

async function runAudit(): Promise<{ issues: Issue[]; summary: Record<string, number> }> {
  const [
    allMasters,
    allMasterNames,
    allSchools,
    allTransmissions,
    allTeachings,
    allTeachingContent,
    allTeachingRoles,
    allCitations,
    allSources,
  ] = await Promise.all([
    db
      .select({
        id: masters.id,
        slug: masters.slug,
        birthYear: masters.birthYear,
        birthPrecision: masters.birthPrecision,
        birthConfidence: masters.birthConfidence,
        deathYear: masters.deathYear,
        deathPrecision: masters.deathPrecision,
        deathConfidence: masters.deathConfidence,
        schoolId: masters.schoolId,
      })
      .from(masters),
    db
      .select({
        masterId: masterNames.masterId,
        locale: masterNames.locale,
        nameType: masterNames.nameType,
        value: masterNames.value,
      })
      .from(masterNames),
    db.select({ id: schools.id, slug: schools.slug }).from(schools),
    db
      .select({
        id: masterTransmissions.id,
        studentId: masterTransmissions.studentId,
        teacherId: masterTransmissions.teacherId,
        type: masterTransmissions.type,
      })
      .from(masterTransmissions),
    db
      .select({
        id: teachings.id,
        slug: teachings.slug,
        authorId: teachings.authorId,
        type: teachings.type,
        attributionStatus: teachings.attributionStatus,
      })
      .from(teachings),
    db
      .select({
        id: teachingContent.id,
        teachingId: teachingContent.teachingId,
        locale: teachingContent.locale,
        translator: teachingContent.translator,
        licenseStatus: teachingContent.licenseStatus,
      })
      .from(teachingContent),
    db
      .select({
        teachingId: teachingMasterRoles.teachingId,
        masterId: teachingMasterRoles.masterId,
        role: teachingMasterRoles.role,
      })
      .from(teachingMasterRoles),
    db
      .select({
        entityType: citations.entityType,
        entityId: citations.entityId,
        fieldName: citations.fieldName,
        sourceId: citations.sourceId,
      })
      .from(citations),
    db
      .select({
        id: sources.id,
        title: sources.title,
        reliability: sources.reliability,
      })
      .from(sources),
  ]);

  const issues: Issue[] = [];
  const schoolSlugById = new Map(allSchools.map((s) => [s.id, s.slug]));
  const masterById = new Map(allMasters.map((m) => [m.id, m]));
  const teachingById = new Map(allTeachings.map((t) => [t.id, t]));

  const citationIndex = indexCitations(allCitations);

  // ---- Masters: date confidence / citation ----
  for (const m of allMasters) {
    const tier = isTier1Master(m.slug) ? "tier1" : "other";
    const bothNull = m.birthYear === null && m.deathYear === null;
    const markedUnknown =
      m.birthPrecision === "unknown" || m.deathPrecision === "unknown";

    // If both dates are null and neither precision/confidence is set, this is
    // a critical silent-gap: the UI will render a blank instead of flagging
    // the missing fact.
    if (bothNull && !markedUnknown) {
      issues.push({
        severity: tier === "tier1" ? "CRITICAL" : "WARNING",
        category: "dates-silent-gap",
        entityType: "master",
        entityId: m.id,
        entitySlug: m.slug,
        tier,
        detail:
          "No birth or death year, and no precision/confidence marker. Set " +
          "birth/death_precision='unknown' so the UI communicates uncertainty.",
      });
    }

    // Non-null dates without a field-level citation: we're making a claim we
    // can't support. Tier-1 masters are critical; others are warnings.
    for (const field of ["birth_year", "death_year"] as const) {
      const year =
        field === "birth_year" ? m.birthYear : m.deathYear;
      if (year === null) continue;
      const hasFieldCitation = citationIndex.hasField("master", m.id, field);
      const hasEntityCitation = citationIndex.hasEntity("master", m.id);
      if (!hasFieldCitation && !hasEntityCitation) {
        issues.push({
          severity: tier === "tier1" ? "CRITICAL" : "WARNING",
          category: "date-uncited",
          entityType: "master",
          entityId: m.id,
          entitySlug: m.slug,
          field,
          tier,
          detail: `${field}=${year} has no citation.`,
        });
      }
    }

    // Low-confidence date published without any citation at all: dangerous,
    // because readers see "1243" and assume certainty.
    for (const [field, year, conf] of [
      ["birth_year", m.birthYear, m.birthConfidence] as const,
      ["death_year", m.deathYear, m.deathConfidence] as const,
    ]) {
      if (year === null) continue;
      if (conf === "low") {
        const hasAny =
          citationIndex.hasField("master", m.id, field) ||
          citationIndex.hasEntity("master", m.id);
        if (!hasAny) {
          issues.push({
            severity: tier === "tier1" ? "CRITICAL" : "WARNING",
            category: "low-confidence-uncited",
            entityType: "master",
            entityId: m.id,
            entitySlug: m.slug,
            field,
            tier,
            detail: `${field}=${year} with confidence=low and no supporting citation.`,
          });
        }
      }
    }

    // School assignment without citation: a lineage claim without provenance.
    if (m.schoolId) {
      const hasAny =
        citationIndex.hasField("master", m.id, "school_id") ||
        citationIndex.hasEntity("master", m.id);
      if (!hasAny) {
        const schoolSlug = schoolSlugById.get(m.schoolId) ?? m.schoolId;
        issues.push({
          severity: tier === "tier1" ? "WARNING" : "INFO",
          category: "school-uncited",
          entityType: "master",
          entityId: m.id,
          entitySlug: m.slug,
          field: "school_id",
          tier,
          detail: `Assigned to school=${schoolSlug} with no citation at entity or field level.`,
        });
      }
    }
  }

  // ---- Masters: native-script name coverage ----
  // For each master, collect the set of scripts present across all their
  // name values. A school may accept any of several scripts (e.g., Korean
  // masters are fine with either hangul or hanja). Flag when the master
  // has none of the expected scripts — that's a real native-script gap.
  const scriptsByMaster = new Map<string, Set<Script>>();
  for (const n of allMasterNames) {
    const detected = detectScripts(n.value);
    if (detected.size === 0) continue;
    const set = scriptsByMaster.get(n.masterId) ?? new Set<Script>();
    for (const s of detected) set.add(s);
    scriptsByMaster.set(n.masterId, set);
  }
  for (const m of allMasters) {
    const schoolSlug = m.schoolId ? schoolSlugById.get(m.schoolId) : undefined;
    if (!schoolSlug) continue;
    const expected = EXPECTED_SCRIPTS_BY_SCHOOL[schoolSlug];
    if (!expected) continue;
    const have = scriptsByMaster.get(m.id) ?? new Set<Script>();
    const hasAny = expected.some((s) => have.has(s));
    if (!hasAny) {
      const tier = isTier1Master(m.slug) ? "tier1" : "other";
      issues.push({
        severity: tier === "tier1" ? "WARNING" : "INFO",
        category: "native-script-missing",
        entityType: "master",
        entityId: m.id,
        entitySlug: m.slug,
        field: `names:${expected.join("|")}`,
        tier,
        detail: `School=${schoolSlug} expects a name in [${expected.join(" or ")}] but no name contains characters in those ranges.`,
      });
    }
  }

  // ---- Transmission edges without any supporting citation ----
  for (const edge of allTransmissions) {
    const hasEntity = citationIndex.hasEntity("master_transmission", edge.id);
    const hasStudentCite = citationIndex.hasField(
      "master",
      edge.studentId,
      "teachers"
    );
    const hasTeacherCite = citationIndex.hasField(
      "master",
      edge.teacherId,
      "students"
    );
    if (hasEntity || hasStudentCite || hasTeacherCite) continue;
    const student = masterById.get(edge.studentId);
    const teacher = masterById.get(edge.teacherId);
    const tier =
      (student && isTier1Master(student.slug)) ||
      (teacher && isTier1Master(teacher.slug))
        ? "tier1"
        : "other";
    issues.push({
      severity: tier === "tier1" ? "CRITICAL" : "WARNING",
      category: "transmission-uncited",
      entityType: "master_transmission",
      entityId: edge.id,
      entitySlug:
        student && teacher
          ? `${student.slug} <- ${teacher.slug}`
          : edge.id,
      tier,
      detail: `Transmission type=${edge.type} has no citation at entity or related field level.`,
    });
  }

  // ---- Teachings: traditional/unresolved attribution without citation ----
  for (const t of allTeachings) {
    if (t.attributionStatus === "verified") continue;
    const hasEntity = citationIndex.hasEntity("teaching", t.id);
    const hasAttrField = citationIndex.hasField(
      "teaching",
      t.id,
      "attribution_status"
    );
    if (hasEntity || hasAttrField) continue;
    issues.push({
      severity: "WARNING",
      category: "attribution-uncited",
      entityType: "teaching",
      entityId: t.id,
      entitySlug: t.slug,
      field: "attribution_status",
      detail: `attribution_status=${t.attributionStatus ?? "null"} has no citation explaining the traditional/unresolved attribution.`,
    });
  }

  // ---- Teaching content: missing license status ----
  for (const c of allTeachingContent) {
    if (c.licenseStatus && c.licenseStatus !== "unknown") continue;
    const t = teachingById.get(c.teachingId);
    issues.push({
      severity: "WARNING",
      category: "license-unset",
      entityType: "teaching_content",
      entityId: c.id,
      entitySlug: t ? `${t.slug}:${c.locale}` : c.id,
      field: "license_status",
      detail: `license_status is ${c.licenseStatus ? "'unknown'" : "null"}. Every translation must declare its license.`,
    });
  }

  // ---- Orphan teachings: no authorId and no teaching_master_roles entry ----
  const teachingsWithRoles = new Set(allTeachingRoles.map((r) => r.teachingId));
  for (const t of allTeachings) {
    if (t.authorId) continue;
    if (teachingsWithRoles.has(t.id)) continue;
    issues.push({
      severity: "WARNING",
      category: "teaching-unattributed",
      entityType: "teaching",
      entityId: t.id,
      entitySlug: t.slug,
      detail: `No author_id and no teaching_master_roles row. Who said this?`,
    });
  }

  // ---- Sources: popular reliability (should usually be downgraded) ----
  for (const s of allSources) {
    if (s.reliability !== "popular") continue;
    issues.push({
      severity: "INFO",
      category: "source-popular",
      entityType: "source",
      entityId: s.id,
      entitySlug: s.title ?? s.id,
      detail: `Source reliability='popular'. Consider replacing with a scholarly source or downgrading claims that depend on it.`,
    });
  }

  // Stable ordering for deterministic diffs: severity desc, then category,
  // then entity slug.
  const severityRank: Record<Severity, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  issues.sort((a, b) => {
    const s = severityRank[a.severity] - severityRank[b.severity];
    if (s !== 0) return s;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.entitySlug !== b.entitySlug)
      return a.entitySlug.localeCompare(b.entitySlug);
    return (a.field ?? "").localeCompare(b.field ?? "");
  });

  const summary = summarize(issues);
  return { issues, summary };
}

// ---------------------------------------------------------------------------
// Citation index — fast lookups by (entityType, entityId, fieldName)
// ---------------------------------------------------------------------------

interface CitationIndex {
  hasEntity(entityType: string, entityId: string): boolean;
  hasField(entityType: string, entityId: string, fieldName: string): boolean;
}

function indexCitations(
  rows: {
    entityType: string;
    entityId: string;
    fieldName: string | null;
    sourceId: string;
  }[]
): CitationIndex {
  const entityKeys = new Set<string>();
  const fieldKeys = new Set<string>();
  for (const r of rows) {
    entityKeys.add(`${r.entityType}:${r.entityId}`);
    if (r.fieldName) {
      fieldKeys.add(`${r.entityType}:${r.entityId}:${r.fieldName}`);
    }
  }
  return {
    hasEntity: (entityType, entityId) =>
      entityKeys.has(`${entityType}:${entityId}`),
    hasField: (entityType, entityId, fieldName) =>
      fieldKeys.has(`${entityType}:${entityId}:${fieldName}`),
  };
}

function summarize(issues: Issue[]): Record<string, number> {
  const counts: Record<string, number> = {
    total: issues.length,
    critical: 0,
    warning: 0,
    info: 0,
    tier1_critical: 0,
    tier1_warning: 0,
  };
  for (const issue of issues) {
    counts[issue.severity.toLowerCase()]++;
    if (issue.tier === "tier1") {
      if (issue.severity === "CRITICAL") counts.tier1_critical++;
      else if (issue.severity === "WARNING") counts.tier1_warning++;
    }
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Report writers
// ---------------------------------------------------------------------------

function escapeCsv(v: string | undefined): string {
  if (v === undefined || v === null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(issues: Issue[], outPath: string): void {
  const rows: string[] = [
    [
      "severity",
      "category",
      "tier",
      "entity_type",
      "entity_slug",
      "entity_id",
      "field",
      "detail",
    ].join(","),
  ];
  for (const i of issues) {
    rows.push(
      [
        i.severity,
        i.category,
        i.tier ?? "",
        i.entityType,
        i.entitySlug,
        i.entityId,
        i.field ?? "",
        i.detail,
      ]
        .map(escapeCsv)
        .join(",")
    );
  }
  fs.writeFileSync(outPath, rows.join("\n") + "\n", "utf-8");
}

function writeMarkdown(
  issues: Issue[],
  summary: Record<string, number>,
  outPath: string
): void {
  const byCategory = new Map<string, Issue[]>();
  for (const issue of issues) {
    const list = byCategory.get(issue.category) ?? [];
    list.push(issue);
    byCategory.set(issue.category, list);
  }
  const categories = Array.from(byCategory.keys()).sort();

  const lines: string[] = [];
  lines.push("# Accuracy Audit Report");
  lines.push("");
  lines.push(
    "Field-level correctness gaps — uncited facts, missing uncertainty markers, unattributed teachings. Produced by `scripts/audit-accuracy.ts`. Regenerate with `npm run audit:accuracy`."
  );
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| severity | count | tier-1 count |");
  lines.push("|---|---:|---:|");
  lines.push(
    `| CRITICAL | ${summary.critical} | ${summary.tier1_critical} |`
  );
  lines.push(
    `| WARNING | ${summary.warning} | ${summary.tier1_warning} |`
  );
  lines.push(`| INFO | ${summary.info} | — |`);
  lines.push(`| **total** | **${summary.total}** | — |`);
  lines.push("");

  if (summary.critical === 0) {
    lines.push("**No CRITICAL issues.** Tier-1 masters have citations for the claims that are hardest to correct after-the-fact.");
  } else {
    lines.push(
      `**${summary.critical} CRITICAL issues.** CI is gated on this number; ship fixes before merging.`
    );
  }
  lines.push("");

  lines.push("## Issues by category");
  lines.push("");
  for (const category of categories) {
    const list = byCategory.get(category)!;
    lines.push(`### ${category} (${list.length})`);
    lines.push("");
    lines.push("| severity | tier | entity | field | detail |");
    lines.push("|---|---|---|---|---|");
    const preview = list.slice(0, 30);
    for (const issue of preview) {
      lines.push(
        `| ${issue.severity} | ${issue.tier ?? "—"} | \`${issue.entityType}/${issue.entitySlug}\` | ${issue.field ?? "—"} | ${issue.detail.replace(/\|/g, "\\|")} |`
      );
    }
    if (list.length > preview.length) {
      lines.push("");
      lines.push(
        `_…and ${list.length - preview.length} more. See \`accuracy-report.csv\` for the complete list._`
      );
    }
    lines.push("");
  }

  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { issues, summary } = await runAudit();
  const reportsDir = path.join(process.cwd(), "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const mdPath = path.join(reportsDir, "accuracy-report.md");
  const csvPath = path.join(reportsDir, "accuracy-report.csv");
  writeMarkdown(issues, summary, mdPath);
  writeCsv(issues, csvPath);

  // Console summary
  console.log("Accuracy audit complete.");
  console.log(
    `  CRITICAL: ${summary.critical} (tier-1: ${summary.tier1_critical})`
  );
  console.log(
    `  WARNING:  ${summary.warning} (tier-1: ${summary.tier1_warning})`
  );
  console.log(`  INFO:     ${summary.info}`);
  console.log(`  total:    ${summary.total}`);
  console.log(`Reports written to:`);
  console.log(`  ${path.relative(process.cwd(), mdPath)}`);
  console.log(`  ${path.relative(process.cwd(), csvPath)}`);

  // Exit code: CI gates on CRITICAL issues.
  if (summary.critical > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
