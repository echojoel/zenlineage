/**
 * Generate per-master thumbnails for the lineage graph image mode.
 *
 * For every portrait in public/masters/*.webp, emit two downsized WebPs:
 *   public/masters/thumb/{slug}-48.webp  (node sprite at 1x)
 *   public/masters/thumb/{slug}-96.webp  (node sprite at retina / 2x)
 *
 * The full-resolution originals in public/masters/ continue to serve
 * detail-page heroes (see the master detail page). Thumbnails are small
 * enough that the entire graph fits in the budget set by GitHub issue #19
 * (≤ 1.5 MB first paint for ~50 visible nodes; ≤ 2 MB for the full roster).
 *
 * Idempotent. Skips thumbnails whose mtime is already newer than the source.
 *
 * Usage:
 *   npm run thumbnails
 *   # or
 *   npx tsx scripts/generate-thumbnails.ts
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MASTERS_DIR = path.join(process.cwd(), "public", "masters");
const THUMB_DIR = path.join(MASTERS_DIR, "thumb");

interface ThumbnailSize {
  suffix: string;
  width: number;
  height: number;
  quality: number;
}

// Chosen to give a small medallion (48px base) plus a retina variant and a
// larger hover/preview variant. Keeping these explicit here so the render
// code can reference the same suffix strings.
const SIZES: ThumbnailSize[] = [
  { suffix: "48", width: 48, height: 64, quality: 78 },
  { suffix: "96", width: 96, height: 128, quality: 80 },
  { suffix: "200", width: 200, height: 267, quality: 82 },
];

interface RunStats {
  processed: number;
  skipped: number;
  failed: number;
  totalBytes: number;
}

async function main() {
  if (!fs.existsSync(MASTERS_DIR)) {
    console.error(`missing ${MASTERS_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(THUMB_DIR, { recursive: true });

  const sources = fs
    .readdirSync(MASTERS_DIR)
    .filter((f) => f.endsWith(".webp"))
    .sort();

  if (sources.length === 0) {
    console.log("no source images found in public/masters/");
    return;
  }

  const stats: RunStats = { processed: 0, skipped: 0, failed: 0, totalBytes: 0 };
  const perSize = new Map<string, { count: number; bytes: number }>();
  for (const s of SIZES) perSize.set(s.suffix, { count: 0, bytes: 0 });

  for (const filename of sources) {
    const slug = path.basename(filename, ".webp");
    const sourcePath = path.join(MASTERS_DIR, filename);
    const sourceStat = fs.statSync(sourcePath);

    for (const size of SIZES) {
      const outPath = path.join(THUMB_DIR, `${slug}-${size.suffix}.webp`);

      if (fs.existsSync(outPath)) {
        const outStat = fs.statSync(outPath);
        if (outStat.mtimeMs >= sourceStat.mtimeMs) {
          // Up to date — skip.
          stats.skipped++;
          const bucket = perSize.get(size.suffix)!;
          bucket.count++;
          bucket.bytes += outStat.size;
          stats.totalBytes += outStat.size;
          continue;
        }
      }

      try {
        await sharp(sourcePath)
          .resize({
            width: size.width,
            height: size.height,
            fit: "cover",
            position: "top", // portraits — prefer the face over the robe
          })
          .webp({ quality: size.quality, effort: 5 })
          .toFile(outPath);
        const outStat = fs.statSync(outPath);
        stats.processed++;
        const bucket = perSize.get(size.suffix)!;
        bucket.count++;
        bucket.bytes += outStat.size;
        stats.totalBytes += outStat.size;
      } catch (err) {
        stats.failed++;
        console.error(`failed ${slug} @${size.suffix}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log(`Thumbnail pipeline complete.`);
  console.log(`  source portraits: ${sources.length}`);
  console.log(`  thumbnails written: ${stats.processed}`);
  console.log(`  thumbnails skipped (up to date): ${stats.skipped}`);
  if (stats.failed > 0) console.log(`  failures: ${stats.failed}`);
  console.log("");
  console.log(`  by size:`);
  for (const size of SIZES) {
    const b = perSize.get(size.suffix)!;
    const avg = b.count > 0 ? Math.round(b.bytes / b.count) : 0;
    console.log(
      `    ${size.width}x${size.height}: ${b.count} files, ${(b.bytes / 1024).toFixed(0)} KB total, avg ${avg} bytes`
    );
  }
  console.log(`  grand total: ${(stats.totalBytes / 1024).toFixed(0)} KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
