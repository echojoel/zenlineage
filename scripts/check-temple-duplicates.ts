/**
 * Report places of practice that look like the same place seeded twice.
 *
 * Reads the seed lists directly rather than the database, so it catches a
 * collision at authoring time — before `npm run prebuild` bakes both copies
 * onto the map. See `scripts/temple-duplicates.ts` for what each signal
 * means and how to clear a false positive.
 *
 * Exits non-zero when anything is flagged, so it can gate a data change.
 *
 * Usage:
 *   npx tsx scripts/check-temple-duplicates.ts
 */

import { SEED_TEMPLES } from "./data/seed-temples";
import { findDuplicateSuspects } from "./temple-duplicates";

const seedsBySlug = new Map(SEED_TEMPLES.map((seed) => [seed.slug, seed]));
const clusters = findDuplicateSuspects(SEED_TEMPLES);

console.log(`[check-temple-duplicates] ${SEED_TEMPLES.length} seeded places`);

if (clusters.length === 0) {
  console.log("[check-temple-duplicates] no duplicate suspects");
  process.exit(0);
}

for (const cluster of clusters) {
  console.log(`\n${cluster.signal} — ${cluster.detail} (spread ${cluster.spreadMeters}m)`);
  for (const slug of cluster.slugs) {
    const seed = seedsBySlug.get(slug);
    if (!seed) continue;
    const name = seed.names.find((n) => n.locale === "en")?.value ?? seed.names[0]?.value;
    console.log(
      `  ${slug}  ${seed.lat.toFixed(5)},${seed.lng.toFixed(5)}  ` +
        `[${seed.geoPrecision ?? "exact"}]  ${seed.region}, ${seed.country}  — ${name}`
    );
  }
}

console.error(
  `\n[check-temple-duplicates] FAIL: ${clusters.length} suspect cluster(s). ` +
    `Merge the duplicate (add a DUP_PATTERNS entry in scripts/build-europe-temples.ts ` +
    `so the generated copy defers to the curated row), or record the pair in ` +
    `VERIFIED_DISTINCT in scripts/temple-duplicates.ts with the reason it is two places.`
);
process.exit(1);
