/**
 * One-time importer: for every master_transmissions edge that has at least one
 * citations row (entity_type='master_transmission'), generate a draft evidence
 * .md file at scripts/data/transmission-evidence/<student>__<teacher>.md.
 *
 * Safe to re-run: if an evidence file already exists for an edge, it is
 * skipped — so re-running is always a no-op for already-imported edges and
 * won't overwrite real evidence files produced by the agent panel.
 *
 * Imported files always start at tier D and have human_review_needed: true
 * because the quotes are placeholders that haven't been verified against the
 * actual page content.
 *
 * Usage:
 *   DATABASE_URL=file:zen.db npx tsx scripts/import-existing-citations-to-evidence.ts
 *   # or
 *   npm run import:legacy-citations
 */

import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import { masters, masterTransmissions, citations, sources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { classifyUrl, type DomainClass } from "@/lib/source-domains";
import type { EvidenceSource } from "@/lib/edge-trust";

const EVIDENCE_DIR = path.join(
  process.cwd(),
  "scripts/data/transmission-evidence"
);

const TODAY = new Date().toISOString().slice(0, 10);

const PLACEHOLDER_QUOTE =
  "(quote pending; imported from legacy citation — please paste verbatim passage that attests the transmission)";

async function main() {
  // 1. Load all masters (id + slug).
  const mastersList = await db
    .select({ id: masters.id, slug: masters.slug })
    .from(masters);
  const idToSlug = new Map(mastersList.map((m) => [m.id, m.slug]));

  // 2. Load all master_transmissions rows.
  const edges = await db
    .select({
      id: masterTransmissions.id,
      studentId: masterTransmissions.studentId,
      teacherId: masterTransmissions.teacherId,
    })
    .from(masterTransmissions);

  // 3. Load citations filtered by entity_type = 'master_transmission'.
  const allCitations = await db
    .select({
      entityId: citations.entityId,
      sourceId: citations.sourceId,
    })
    .from(citations)
    .where(eq(citations.entityType, "master_transmission"));

  // Group citations by edge id.
  const citationsByEdge = new Map<string, string[]>();
  for (const c of allCitations) {
    const arr = citationsByEdge.get(c.entityId) ?? [];
    arr.push(c.sourceId);
    citationsByEdge.set(c.entityId, arr);
  }

  // 4. Load all sources rows, build sourceById map.
  const allSources = await db
    .select({
      id: sources.id,
      title: sources.title,
      url: sources.url,
    })
    .from(sources);

  type SourceRow = { id: string; title: string | null; url: string | null };
  const sourceById = new Map<string, SourceRow>(
    allSources.map((s) => [s.id, s])
  );

  // Ensure output directory exists.
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }

  let imported = 0;
  let skippedExisting = 0;
  let skippedNoCitations = 0;

  // 5. For each edge with at least one citation:
  for (const edge of edges) {
    const studentSlug = idToSlug.get(edge.studentId);
    const teacherSlug = idToSlug.get(edge.teacherId);
    if (!studentSlug || !teacherSlug) continue;

    const citationSourceIds = citationsByEdge.get(edge.id) ?? [];
    if (citationSourceIds.length === 0) {
      skippedNoCitations++;
      continue;
    }

    const outputFile = path.join(
      EVIDENCE_DIR,
      `${studentSlug}__${teacherSlug}.md`
    );

    // Skip if the evidence file already exists.
    if (fs.existsSync(outputFile)) {
      skippedExisting++;
      continue;
    }

    // Build EvidenceSource list — one entry per citation source that has a URL.
    const evSources: EvidenceSource[] = [];
    for (const srcId of citationSourceIds) {
      const src = sourceById.get(srcId);
      if (!src || !src.url) continue;

      const { class: domainClass, publisher } = classifyUrl(src.url);
      evSources.push({
        publisher: publisher ?? src.title ?? src.url,
        url: src.url,
        domain_class: domainClass as DomainClass | "unknown",
        retrieved_on: TODAY,
        quote: PLACEHOLDER_QUOTE,
      });
    }

    if (evSources.length === 0) {
      // All citations for this edge point to sources without URLs — skip.
      skippedNoCitations++;
      continue;
    }

    // Imported files always start at tier D — the quotes are placeholders
    // that haven't been verified against the actual page content. A future
    // pass replaces the placeholder with the real verbatim quote, at which
    // point the audit + a re-seed will compute the real tier.
    const tier: "D" = "D";

    // Serialize sources as YAML list entries.
    const sourcesYaml = evSources
      .map(
        (s) =>
          `  - publisher: "${s.publisher.replace(/"/g, '\\"')}"\n` +
          `    url: "${s.url}"\n` +
          `    domain_class: "${s.domain_class}"\n` +
          `    retrieved_on: "${s.retrieved_on}"\n` +
          `    quote: "${s.quote.replace(/"/g, '\\"')}"`
      )
      .join("\n");

    const frontmatter = `---
student: "${studentSlug}"
teacher: "${teacherSlug}"
tier: "${tier}"
human_review_needed: true
reducer_notes: >
  Auto-imported from legacy citations table on ${TODAY}. Each source URL was
  found in the citations rows for this transmission edge. Quotes are placeholders
  — a reviewer must replace them with verbatim passages from the linked pages
  before this file can be promoted above tier D.
sources:
${sourcesYaml}
---
`;

    fs.writeFileSync(outputFile, frontmatter, "utf-8");
    imported++;
  }

  console.log(
    `[import-existing] imported=${imported} skipped_existing=${skippedExisting} skipped_no_url_citations=${skippedNoCitations}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
