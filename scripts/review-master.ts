/**
 * Reviewer CLI for recording field-level sign-off against a master.
 *
 * Writes rows into the `review_status` table — one per (entityType, entityId,
 * fieldName) — so we can track which biographical claims have been
 * cross-checked against scholarly sources and which still need work. This is
 * the discipline side of the data accuracy audit (see docs/EDITORIAL.md).
 *
 * Usage:
 *
 *   DATABASE_URL=file:zen.db npx tsx scripts/review-master.ts <slug> \
 *     --field <name> --status <approved|needs-research|disputed> \
 *     --reviewer <initials> [--notes "..."]
 *
 * Examples:
 *
 *   # Sign off on Dōgen's birth year after cross-checking Dumoulin vol.2.
 *   npx tsx scripts/review-master.ts dogen-kigen \
 *     --field birth_year --status approved --reviewer js \
 *     --notes "Dumoulin 2005 vol.2 p.51 — 1200, no scholarly dispute."
 *
 *   # Flag Bodhidharma's arrival year as needing work.
 *   npx tsx scripts/review-master.ts bodhidharma \
 *     --field arrival_year --status needs-research --reviewer js \
 *     --notes "Traditional 520 CE; McRae 2003 questions historicity."
 *
 *   # List existing review rows for a master.
 *   npx tsx scripts/review-master.ts dogen-kigen --list
 *
 * Notes:
 *   - The `review_status.id` is generated as a stable hash of
 *     `${masterId}:${fieldName}` so re-running the command with the same
 *     master+field UPDATES the existing row instead of duplicating it.
 *   - `reviewedAt` is recorded in ISO 8601 UTC.
 */

import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { masters, reviewStatus } from "@/db/schema";

const VALID_STATUS = new Set(["approved", "needs-research", "disputed"]);

interface CliArgs {
  slug: string;
  list: boolean;
  field?: string;
  status?: string;
  reviewer?: string;
  notes?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { slug: "", list: false };
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--list") {
      args.list = true;
    } else if (a === "--field") {
      args.field = argv[++i];
    } else if (a === "--status") {
      args.status = argv[++i];
    } else if (a === "--reviewer") {
      args.reviewer = argv[++i];
    } else if (a === "--notes") {
      args.notes = argv[++i];
    } else if (a === "--help" || a === "-h") {
      printUsageAndExit(0);
    } else if (a.startsWith("--")) {
      console.error(`Unknown flag: ${a}`);
      printUsageAndExit(2);
    } else {
      positional.push(a);
    }
  }
  if (positional.length !== 1) {
    console.error("Expected exactly one positional argument: <master-slug>");
    printUsageAndExit(2);
  }
  args.slug = positional[0];
  return args;
}

function printUsageAndExit(code: number): never {
  console.error(
    [
      "Usage: review-master.ts <slug> [--list]",
      "       review-master.ts <slug> --field <name> --status <approved|needs-research|disputed> --reviewer <initials> [--notes \"…\"]",
      "",
      "See the script header for examples.",
    ].join("\n")
  );
  process.exit(code);
}

function reviewId(masterId: string, fieldName: string): string {
  return crypto
    .createHash("sha1")
    .update(`master:${masterId}:${fieldName}`)
    .digest("hex")
    .slice(0, 24);
}

async function listReviews(masterId: string, slug: string): Promise<void> {
  const rows = await db
    .select()
    .from(reviewStatus)
    .where(and(eq(reviewStatus.entityType, "master"), eq(reviewStatus.entityId, masterId)));

  if (rows.length === 0) {
    console.log(`No review_status rows yet for master/${slug}.`);
    return;
  }

  console.log(`Review status for master/${slug}:`);
  for (const r of rows) {
    const stamp = r.reviewedAt ? ` @ ${r.reviewedAt}` : "";
    const who = r.reviewer ? ` by ${r.reviewer}` : "";
    console.log(`  ${r.fieldName ?? "(record)"}: ${r.status}${who}${stamp}`);
    if (r.notes) console.log(`    notes: ${r.notes}`);
  }
}

async function recordReview(
  masterId: string,
  slug: string,
  args: CliArgs
): Promise<void> {
  if (!args.field || !args.status || !args.reviewer) {
    console.error("--field, --status, and --reviewer are all required when recording a review.");
    printUsageAndExit(2);
  }
  if (!VALID_STATUS.has(args.status)) {
    console.error(
      `Invalid --status '${args.status}'. Must be one of: ${[...VALID_STATUS].join(", ")}.`
    );
    process.exit(2);
  }

  const id = reviewId(masterId, args.field);
  const reviewedAt = new Date().toISOString();

  await db
    .insert(reviewStatus)
    .values({
      id,
      entityType: "master",
      entityId: masterId,
      fieldName: args.field,
      locale: null,
      status: args.status,
      reviewer: args.reviewer,
      reviewedAt,
      notes: args.notes ?? null,
    })
    .onConflictDoUpdate({
      target: reviewStatus.id,
      set: {
        status: args.status,
        reviewer: args.reviewer,
        reviewedAt,
        notes: args.notes ?? null,
      },
    });

  console.log(
    `✓ Recorded review: master/${slug} field=${args.field} status=${args.status} reviewer=${args.reviewer}`
  );
  if (args.notes) console.log(`  notes: ${args.notes}`);
  console.log(
    "Note: this writes to the local zen.db. Production data is rebuilt from seed scripts on every deploy — promote durable review decisions into seed/audit data when they need to survive a rebuild."
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const masterRow = await db
    .select({ id: masters.id, slug: masters.slug })
    .from(masters)
    .where(eq(masters.slug, args.slug))
    .limit(1);

  const master = masterRow[0];
  if (!master) {
    console.error(`No master found with slug='${args.slug}'.`);
    process.exit(1);
  }

  if (args.list) {
    await listReviews(master.id, master.slug);
    return;
  }

  await recordReview(master.id, master.slug, args);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
