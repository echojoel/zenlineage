/**
 * Structural reviewer for an evidence file. Cannot upgrade tier, can
 * downgrade. Cannot mutate sources.
 *
 * The agentic-session reviewer (skeptical reader) uses this harness to
 * apply mechanical changes after its own judgement.
 *
 * Usage:
 *   npx tsx scripts/agent-harness/review-evidence.ts \
 *     --file <path-to-evidence.md> \
 *     --downgrade-to <tier> \
 *     --needs-review \
 *     --append-note "..."
 */
import fs from "node:fs";
import { parseEvidenceFile, type Tier } from "@/lib/edge-trust";

function parseArgs(argv: string[]) {
  const a: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--needs-review") a["needs-review"] = true;
    else if (k.startsWith("--")) a[k.slice(2)] = argv[++i];
  }
  return a as { file?: string; "downgrade-to"?: string; "needs-review"?: boolean; "append-note"?: string };
}

const ORDER: Record<Tier, number> = { A: 3, B: 2, C: 1, D: 0 };

function main() {
  const args = parseArgs(process.argv);
  if (!args.file) throw new Error("--file required");
  const raw = fs.readFileSync(args.file, "utf-8");
  const r = parseEvidenceFile(raw);
  if (!r.ok) throw new Error("file does not parse: " + r.errors.join("; "));

  const cur = r.parsed.tier;
  const target = (args["downgrade-to"] ?? cur) as Tier;
  if (ORDER[target] > ORDER[cur]) {
    throw new Error(`reviewer may not upgrade tier (${cur} → ${target})`);
  }

  let updated = raw.replace(/^tier:\s*[ABCD]\b/m, `tier: ${target}`);
  if (args["needs-review"]) {
    updated = updated.replace(/^human_review_needed:\s*(true|false)\b/m, "human_review_needed: true");
  }
  if (args["append-note"]) {
    if (/^reviewer_notes:\s*\|/m.test(updated)) {
      // Append to existing reviewer_notes block.
      updated = updated.replace(/(^reviewer_notes:\s*\|\n(?:[\s\S]*?))(\n---)/m, (_m, head, tail) => {
        return `${head}\n  ${args["append-note"]}${tail}`;
      });
    } else {
      // Insert a new reviewer_notes block immediately before the closing ---.
      // The frontmatter is delimited by exactly two `---` lines: opening at the
      // very top, closing somewhere later. We want to insert before the SECOND
      // one. Splitting by `\n---\n` and rejoining places the new block in the
      // right slot.
      const parts = updated.split(/\n---\s*\n/);
      // parts[0] = opening "---\n<frontmatter>", parts[1] = body after the closing ---
      // We want to append to parts[0] before re-joining.
      if (parts.length >= 2) {
        parts[0] = parts[0].trimEnd() + "\nreviewer_notes: |\n  " + args["append-note"];
        updated = parts.join("\n---\n");
      } else {
        // Unexpected shape; fall through without mutation rather than corrupt.
        console.warn("review-evidence: could not locate frontmatter closing delimiter; skipping append-note insertion");
      }
    }
  }
  fs.writeFileSync(args.file, updated);
}

main();
