/**
 * Reducer harness for the transmission-evidence panel.
 *
 * Input: three researcher envelopes (JSON files) for one edge.
 * Output: a merged evidence .md file written to
 *   scripts/data/transmission-evidence/<student>__<teacher>.md
 *
 * Usage:
 *   npx tsx scripts/agent-harness/reduce-envelopes.ts \
 *     --student <slug> --teacher <slug> \
 *     --envelopes <file1>,<file2>,<file3>
 */
import fs from "node:fs";
import path from "node:path";
import { computeTier, type EvidenceSource } from "@/lib/edge-trust";

interface Envelope {
  sources: EvidenceSource[];
  confidence: "low" | "medium" | "high";
  dissent_note?: string;
}

function canonicalUrl(u: string): string {
  try {
    const url = new URL(u);
    url.hash = "";
    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return u.toLowerCase();
  }
}

function parseArgs(argv: string[]) {
  const a: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith("--")) a[k.slice(2)] = argv[++i];
  }
  return a;
}

function main() {
  const args = parseArgs(process.argv);
  const envelopes: Envelope[] = (args.envelopes ?? "")
    .split(",")
    .filter(Boolean)
    .map((p) => JSON.parse(fs.readFileSync(p, "utf-8")));

  const seen = new Map<string, EvidenceSource>();
  for (const env of envelopes) {
    for (const s of env.sources ?? []) {
      const key = canonicalUrl(s.url);
      if (!seen.has(key)) seen.set(key, s);
    }
  }
  const sources = Array.from(seen.values());
  const tier = computeTier(sources);

  // Substantive contradiction heuristic:
  //   - ≥2 envelopes returned with confidence=low (researchers themselves
  //     uncertain), OR
  //   - all three envelopes returned zero sources (no one could find a
  //     credible source), OR
  //   - mixed signal: at least one envelope had a non-empty dissent_note
  //     AND at least one envelope returned zero sources.
  //
  // We do NOT use disjoint-hostname-sets as a signal — three researchers
  // each finding a different reputable source is the EXPECTED happy path
  // of multi-source corroboration, not a sign of contradiction. Semantic
  // disagreement between quotes is the reviewer agent's responsibility.
  const lowConfidenceCount = envelopes.filter((e) => e.confidence === "low").length;
  const emptyCount = envelopes.filter((e) => (e.sources ?? []).length === 0).length;
  const dissentCount = envelopes.filter((e) => e.dissent_note && e.dissent_note.trim().length > 0).length;
  const humanReviewNeeded =
    lowConfidenceCount >= 2 ||
    emptyCount === envelopes.length ||
    (dissentCount >= 1 && emptyCount >= 1);

  const reducerNotes = envelopes
    .map((e, i) => `R${i + 1}: confidence=${e.confidence}${e.dissent_note ? `, dissent="${e.dissent_note}"` : ""}`)
    .join("\n");

  const md = [
    "---",
    `student: ${args.student}`,
    `teacher: ${args.teacher}`,
    `tier: ${tier}`,
    `verified_at: ${new Date().toISOString().slice(0, 10)}`,
    `sources:`,
    ...sources.flatMap((s) => [
      `  - publisher: ${JSON.stringify(s.publisher)}`,
      `    url: ${s.url}`,
      `    domain_class: ${s.domain_class}`,
      `    retrieved_on: ${s.retrieved_on}`,
      `    quote: |`,
      ...s.quote.split("\n").map((l) => `      ${l}`),
    ]),
    `reducer_notes: |`,
    ...reducerNotes.split("\n").map((l) => `  ${l}`),
    `human_review_needed: ${humanReviewNeeded}`,
    "---",
    "",
  ].join("\n");

  const outDir = path.join(process.cwd(), "scripts/data/transmission-evidence");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${args.student}__${args.teacher}.md`);
  fs.writeFileSync(outPath, md);
  console.log(outPath);
}

main();
