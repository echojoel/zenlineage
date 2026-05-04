/**
 * Image coverage audit: emit a deterministic report of every master's image
 * state, so we can track progress toward the "every master has at least one
 * published image" goal (see GitHub issue #14).
 *
 * Outputs:
 *   reports/image-coverage-audit.csv — one row per master, machine-readable
 *   reports/image-coverage-audit.md  — human digest with summary stats
 *
 * Usage:
 *   npm run audit:images
 *   # or
 *   DATABASE_URL=file:zen.db tsx scripts/audit-images.ts
 *
 * Exit code:
 *   0 if coverage meets the target (default 95% of Tier-1 masters with a
 *     cited image). 1 otherwise — CI gates on this.
 *
 * Design notes:
 *   * "Published" means: a media_assets row exists AND a citations row
 *     exists keyed to that media_asset. This matches the UI's publish gate.
 *   * Tier-1 masters are weighted more heavily: we set a separate, stricter
 *     threshold for them.
 *   * Deterministic output — sorted by severity then slug so git diffs are
 *     meaningful across runs.
 */

import fs from "node:fs";
import path from "node:path";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masters,
  mediaAssets,
  schools,
} from "@/db/schema";
import { isTier1Master } from "@/lib/editorial-tiers";

type Status = "published" | "uncited" | "missing";

interface Row {
  slug: string;
  tier: "tier1" | "other";
  schoolSlug: string;
  englishName: string;
  birthYear: number | null;
  deathYear: number | null;
  era: string;
  mediaAssetCount: number;
  hasCitation: boolean;
  status: Status;
  storagePath: string | null;
  notes: string;
}

function classifyEra(birthYear: number | null, deathYear: number | null): string {
  const year = birthYear ?? deathYear;
  if (year === null) return "unknown";
  if (year < 0) return "pre-CE";
  if (year < 600) return "Indian / early Chan";
  if (year < 900) return "Tang";
  if (year < 1279) return "Song";
  if (year < 1600) return "medieval Japanese / Korean";
  if (year < 1868) return "Edo";
  if (year < 1950) return "modern";
  return "contemporary";
}

async function runAudit() {
  const [
    allMasters,
    allSchools,
    allNames,
    allMedia,
    allCitations,
  ] = await Promise.all([
    db
      .select({
        id: masters.id,
        slug: masters.slug,
        birthYear: masters.birthYear,
        deathYear: masters.deathYear,
        schoolId: masters.schoolId,
      })
      .from(masters),
    db.select({ id: schools.id, slug: schools.slug }).from(schools),
    db
      .select({
        masterId: masterNames.masterId,
        nameType: masterNames.nameType,
        locale: masterNames.locale,
        value: masterNames.value,
      })
      .from(masterNames)
      .where(eq(masterNames.locale, "en")),
    db
      .select({
        id: mediaAssets.id,
        entityId: mediaAssets.entityId,
        storagePath: mediaAssets.storagePath,
      })
      .from(mediaAssets)
      .where(eq(mediaAssets.entityType, "master")),
    db
      .select({ entityId: citations.entityId })
      .from(citations)
      .where(eq(citations.entityType, "media_asset")),
  ]);

  const schoolSlugById = new Map(allSchools.map((s) => [s.id, s.slug]));

  // For each master, gather the set of their media asset ids and one
  // storage path we can cite in the report.
  const mediaByMaster = new Map<string, { id: string; storagePath: string | null }[]>();
  for (const m of allMedia) {
    const list = mediaByMaster.get(m.entityId) ?? [];
    list.push({ id: m.id, storagePath: m.storagePath });
    mediaByMaster.set(m.entityId, list);
  }

  const citedMediaAssetIds = new Set(allCitations.map((c) => c.entityId));

  // English names — prefer dharma, fall back to first available.
  const dharmaName = new Map<string, string>();
  const anyName = new Map<string, string>();
  for (const n of allNames) {
    if (n.nameType === "dharma" && !dharmaName.has(n.masterId)) {
      dharmaName.set(n.masterId, n.value);
    }
    if (!anyName.has(n.masterId)) {
      anyName.set(n.masterId, n.value);
    }
  }

  const rows: Row[] = allMasters.map((m) => {
    const media = mediaByMaster.get(m.id) ?? [];
    const published = media.find((asset) => citedMediaAssetIds.has(asset.id)) ?? null;

    let status: Status;
    let notes: string;
    if (published) {
      status = "published";
      notes = "";
    } else if (media.length > 0) {
      status = "uncited";
      notes =
        "Media asset row exists but no citation is attached. " +
        "Run scripts/backfill-image-citations.ts or add a citation row.";
    } else {
      status = "missing";
      notes =
        "No media_assets row. Source options: Wikipedia pageimage " +
        "(preferred), curated portrait from zazen mobile import, " +
        "school-sigil fallback if no portrait exists anywhere.";
    }

    return {
      slug: m.slug,
      tier: isTier1Master(m.slug) ? "tier1" : "other",
      schoolSlug: m.schoolId ? (schoolSlugById.get(m.schoolId) ?? m.schoolId) : "",
      englishName: dharmaName.get(m.id) ?? anyName.get(m.id) ?? m.slug,
      birthYear: m.birthYear,
      deathYear: m.deathYear,
      era: classifyEra(m.birthYear, m.deathYear),
      mediaAssetCount: media.length,
      hasCitation: Boolean(published),
      status,
      storagePath: published?.storagePath ?? null,
      notes,
    };
  });

  // Deterministic ordering: tier-1 first, then by status severity (missing >
  // uncited > published), then by slug.
  const statusRank: Record<Status, number> = {
    missing: 0,
    uncited: 1,
    published: 2,
  };
  rows.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier === "tier1" ? -1 : 1;
    const s = statusRank[a.status] - statusRank[b.status];
    if (s !== 0) return s;
    return a.slug.localeCompare(b.slug);
  });

  return rows;
}

function computeSummary(rows: Row[]) {
  const total = rows.length;
  const published = rows.filter((r) => r.status === "published").length;
  const uncited = rows.filter((r) => r.status === "uncited").length;
  const missing = rows.filter((r) => r.status === "missing").length;

  const tier1 = rows.filter((r) => r.tier === "tier1");
  const tier1Published = tier1.filter((r) => r.status === "published").length;

  const perSchool = new Map<string, { total: number; published: number }>();
  for (const r of rows) {
    const key = r.schoolSlug || "(unassigned)";
    const current = perSchool.get(key) ?? { total: 0, published: 0 };
    current.total++;
    if (r.status === "published") current.published++;
    perSchool.set(key, current);
  }

  const perEra = new Map<string, { total: number; published: number }>();
  for (const r of rows) {
    const current = perEra.get(r.era) ?? { total: 0, published: 0 };
    current.total++;
    if (r.status === "published") current.published++;
    perEra.set(r.era, current);
  }

  return {
    total,
    published,
    uncited,
    missing,
    publishedPct: total > 0 ? (100 * published) / total : 0,
    tier1Total: tier1.length,
    tier1Published,
    tier1Pct: tier1.length > 0 ? (100 * tier1Published) / tier1.length : 0,
    perSchool: Array.from(perSchool.entries())
      .map(([slug, c]) => ({
        slug,
        ...c,
        pct: c.total > 0 ? (100 * c.published) / c.total : 0,
      }))
      .sort((a, b) => a.pct - b.pct || a.slug.localeCompare(b.slug)),
    perEra: Array.from(perEra.entries())
      .map(([era, c]) => ({
        era,
        ...c,
        pct: c.total > 0 ? (100 * c.published) / c.total : 0,
      }))
      .sort((a, b) => a.pct - b.pct || a.era.localeCompare(b.era)),
  };
}

// ---------------------------------------------------------------------------
// Report writers
// ---------------------------------------------------------------------------

function escapeCsv(v: string | number | null | boolean): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(rows: Row[], outPath: string): void {
  const header = [
    "tier",
    "status",
    "slug",
    "english_name",
    "school",
    "era",
    "birth_year",
    "death_year",
    "media_asset_count",
    "has_citation",
    "storage_path",
    "notes",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.tier,
        r.status,
        r.slug,
        r.englishName,
        r.schoolSlug,
        r.era,
        r.birthYear,
        r.deathYear,
        r.mediaAssetCount,
        r.hasCitation,
        r.storagePath,
        r.notes,
      ]
        .map(escapeCsv)
        .join(",")
    );
  }
  fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf-8");
}

function writeMarkdown(
  rows: Row[],
  summary: ReturnType<typeof computeSummary>,
  outPath: string
): void {
  const lines: string[] = [];
  lines.push("# Image coverage audit");
  lines.push("");
  lines.push(
    "Every master's image-publication state. Produced by `scripts/audit-images.ts`. Regenerate with `npm run audit:images`."
  );
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| metric | count | share |");
  lines.push("|---|---:|---:|");
  lines.push(
    `| total masters | ${summary.total} | — |`
  );
  lines.push(
    `| **published** (media + citation) | **${summary.published}** | ${summary.publishedPct.toFixed(1)}% |`
  );
  lines.push(
    `| uncited (media without citation) | ${summary.uncited} | ${((100 * summary.uncited) / Math.max(1, summary.total)).toFixed(1)}% |`
  );
  lines.push(
    `| missing (no media at all) | ${summary.missing} | ${((100 * summary.missing) / Math.max(1, summary.total)).toFixed(1)}% |`
  );
  lines.push("");
  lines.push(
    `**Tier-1 coverage:** ${summary.tier1Published} / ${summary.tier1Total} (${summary.tier1Pct.toFixed(1)}%)`
  );
  lines.push("");

  lines.push("## By school");
  lines.push("");
  lines.push("| school | published | total | coverage |");
  lines.push("|---|---:|---:|---:|");
  for (const s of summary.perSchool) {
    lines.push(`| ${s.slug} | ${s.published} | ${s.total} | ${s.pct.toFixed(1)}% |`);
  }
  lines.push("");

  lines.push("## By era");
  lines.push("");
  lines.push("| era | published | total | coverage |");
  lines.push("|---|---:|---:|---:|");
  for (const e of summary.perEra) {
    lines.push(`| ${e.era} | ${e.published} | ${e.total} | ${e.pct.toFixed(1)}% |`);
  }
  lines.push("");

  // Tier-1 gaps are the most important to act on. Surface the full list of
  // tier-1 masters that don't yet have a published image.
  const tier1Gaps = rows.filter(
    (r) => r.tier === "tier1" && r.status !== "published"
  );
  lines.push("## Tier-1 masters still without a published image");
  lines.push("");
  if (tier1Gaps.length === 0) {
    lines.push("_None. Every Tier-1 master has a cited image. ✓_");
  } else {
    lines.push("| slug | school | era | status | notes |");
    lines.push("|---|---|---|---|---|");
    for (const r of tier1Gaps) {
      lines.push(
        `| \`${r.slug}\` | ${r.schoolSlug} | ${r.era} | ${r.status} | ${r.notes.replace(/\|/g, "\\|")} |`
      );
    }
  }
  lines.push("");

  lines.push("## Non-Tier-1 gaps (preview)");
  lines.push("");
  const otherGaps = rows.filter(
    (r) => r.tier === "other" && r.status !== "published"
  );
  const preview = otherGaps.slice(0, 30);
  if (otherGaps.length === 0) {
    lines.push("_None._");
  } else {
    lines.push("| slug | school | era | status |");
    lines.push("|---|---|---|---|");
    for (const r of preview) {
      lines.push(
        `| \`${r.slug}\` | ${r.schoolSlug} | ${r.era} | ${r.status} |`
      );
    }
    if (otherGaps.length > preview.length) {
      lines.push("");
      lines.push(
        `_…and ${otherGaps.length - preview.length} more. See \`image-coverage-audit.csv\` for the full list._`
      );
    }
  }
  lines.push("");

  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
}

// ---------------------------------------------------------------------------
// CI threshold — fail loudly if coverage regresses.
// ---------------------------------------------------------------------------

// Floors are regression gates, not targets. Keep them at-or-just-below the
// current baseline so the audit fails only when coverage slips, and raise
// them as image coverage improves. The long-term *target* (tracked in the
// GitHub issue, not in code) is ≥ 95% overall.
//
// Tier-1 = patriarchs, founders, modern transmitters — the images readers
// most expect to see. We hold these to a stricter floor.
const TIER1_COVERAGE_FLOOR = 95;
const OVERALL_COVERAGE_FLOOR = 40;

async function main() {
  const rows = await runAudit();
  const summary = computeSummary(rows);

  const reportsDir = path.join(process.cwd(), "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const csvPath = path.join(reportsDir, "image-coverage-audit.csv");
  const mdPath = path.join(reportsDir, "image-coverage-audit.md");
  writeCsv(rows, csvPath);
  writeMarkdown(rows, summary, mdPath);

  console.log("Image coverage audit complete.");
  console.log(`  total masters:          ${summary.total}`);
  console.log(
    `  published:              ${summary.published} (${summary.publishedPct.toFixed(1)}%)`
  );
  console.log(`  uncited media:          ${summary.uncited}`);
  console.log(`  missing media:          ${summary.missing}`);
  console.log(
    `  tier-1 published:       ${summary.tier1Published} / ${summary.tier1Total} (${summary.tier1Pct.toFixed(1)}%)`
  );
  console.log("");
  console.log(`  ${path.relative(process.cwd(), mdPath)}`);
  console.log(`  ${path.relative(process.cwd(), csvPath)}`);

  let exit = 0;
  if (summary.tier1Pct < TIER1_COVERAGE_FLOOR) {
    console.error(
      `\nTier-1 image coverage is ${summary.tier1Pct.toFixed(1)}% — below the ${TIER1_COVERAGE_FLOOR}% floor.`
    );
    exit = 1;
  }
  if (summary.publishedPct < OVERALL_COVERAGE_FLOOR) {
    console.error(
      `\nOverall image coverage is ${summary.publishedPct.toFixed(1)}% — below the ${OVERALL_COVERAGE_FLOOR}% floor.`
    );
    exit = 1;
  }
  process.exit(exit);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
