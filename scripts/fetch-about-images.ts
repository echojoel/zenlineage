/**
 * One-off: fetch Wikipedia pageimages for zen-thematic illustrations on the
 * About page. Per CLAUDE.md, only Wikipedia pageimages (not Commons search)
 * are safe to fetch automatically — every URL below comes from
 * `prop=pageimages` on a verified article title.
 *
 * Usage:  npx tsx scripts/fetch-about-images.ts
 */

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const UA = "zenlineage-image-fetch/1.0 (https://zenlineage.org)";

interface AboutImage {
  /** Output filename under /public — e.g. "about-zazen.webp". */
  slug: string;
  /** Wikipedia article title used to resolve the pageimage. */
  article: string;
  /** Caption attribution text (used in console log only; JSX caption hand-written). */
  caption: string;
}

const TARGETS: AboutImage[] = [
  {
    slug: "about-zazen",
    article: "Zazen",
    caption: "Kōdō Sawaki seated in zazen — Wikipedia, public domain.",
  },
  {
    slug: "about-ryoanji",
    article: "Ryoan-ji",
    caption: "Ryōan-ji karesansui rock garden, Kyoto — Wikipedia / Commons.",
  },
  {
    slug: "about-zendo",
    article: "Zendo",
    caption: "Zendō at Tōfuku-ji — Wikipedia / Commons.",
  },
  {
    slug: "about-eiheiji",
    article: "Eihei-ji",
    caption: "Eihei-ji, Dōgen's principal Sōtō temple — Wikipedia / Commons.",
  },
  {
    slug: "about-ten-bulls",
    article: "Ten_Bulls",
    caption:
      "Oxherding (Ten Bulls), Edo-period silk handscroll — Met Museum via Wikipedia, public domain.",
  },
];

async function findPageImage(title: string): Promise<string | null> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&redirects=1` +
    `&prop=pageimages&pithumbsize=1200&titles=${encodeURIComponent(title)}&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${title}`);
  const data = (await res.json()) as {
    query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
  };
  const pages = data.query?.pages ?? {};
  const key = Object.keys(pages)[0];
  if (!key || key === "-1") return null;
  return pages[key]?.thumbnail?.source ?? null;
}

async function downloadAndResize(imageUrl: string, outPath: string) {
  const res = await fetch(imageUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${imageUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).resize(960, null, { fit: "inside" }).webp({ quality: 82 }).toFile(outPath);
  const meta = await sharp(outPath).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0 };
}

async function main() {
  const publicDir = path.join(process.cwd(), "public");
  await fs.mkdir(publicDir, { recursive: true });

  for (const t of TARGETS) {
    const out = path.join(publicDir, `${t.slug}.webp`);
    process.stdout.write(`  → ${t.slug.padEnd(22)} `);
    const remote = await findPageImage(t.article);
    if (!remote) {
      console.log("(no pageimage — skipped)");
      continue;
    }
    const { width, height } = await downloadAndResize(remote, out);
    console.log(`✓ ${width}×${height}  ${path.basename(out)}`);
    await new Promise((r) => setTimeout(r, 600));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
