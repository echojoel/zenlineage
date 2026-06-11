/**
 * Guard for the Cloudflare Pages 20,000-file limit.
 *
 * Run by `npm run deploy` after packaging `out-cf/`. Fails the deploy with
 * headroom to spare so the limit is hit in CI output, not in production.
 * If this trips: the biggest lever is route count (each route ships one
 * .html + one .txt payload + any opengraph image) — see the deploy notes
 * in CLAUDE.md before re-introducing any blanket .txt stripping, which
 * breaks client-side navigation.
 */
import fs from "node:fs";
import path from "node:path";

const LIMIT = 20_000;
const SOFT_CAP = 19_000;

function countFiles(dir: string): number {
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) n += countFiles(p);
    else n += 1;
  }
  return n;
}

const target = process.argv[2] ?? "out-cf";
const count = countFiles(target);
console.log(`[check-cf-filecount] ${target}: ${count} files (soft cap ${SOFT_CAP}, CF limit ${LIMIT})`);

if (count > SOFT_CAP) {
  console.error(
    `[check-cf-filecount] FAIL: ${count} files exceeds the soft cap of ${SOFT_CAP}. ` +
      `Cloudflare Pages rejects deployments over ${LIMIT} files.`
  );
  process.exit(1);
}
