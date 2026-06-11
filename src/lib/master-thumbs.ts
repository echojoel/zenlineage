import fs from "node:fs";
import path from "node:path";

/**
 * Map a master portrait `storagePath` (e.g. `/masters/dogen.webp`) to a
 * pre-generated thumbnail under `/masters/thumb/` (see
 * `scripts/generate-thumbnails.ts`). Build-time only — checks the file
 * exists on disk and falls back to the original path when it doesn't
 * (SVG placeholders and external URLs pass through unchanged).
 */
export function masterThumbPath(
  storagePath: string | null,
  size: 48 | 96 | 200
): string | null {
  if (!storagePath) return null;
  const m = storagePath.match(/^\/masters\/([^/]+)\.webp$/);
  if (!m) return storagePath;
  const thumb = `/masters/thumb/${m[1]}-${size}.webp`;
  return fs.existsSync(path.join(process.cwd(), "public", thumb))
    ? thumb
    : storagePath;
}
