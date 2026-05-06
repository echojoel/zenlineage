/**
 * One-shot analysis script: parse the Gemini Deep Research markdown tables
 * at scripts/data/raw/gemini-temples-global-2026-05-06.md, slugify each row,
 * and diff against existing temple slugs in seed-temples.ts +
 * seed-temples-europe.ts. Reports new vs. already-covered counts per
 * tradition section so we can decide what to ingest.
 *
 * Run: npx tsx scripts/analyze-gemini-temples.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

interface Row {
  section: string;
  name: string;
  tradition: string;
  schoolAffiliation: string;
  country: string;
  city: string;
  website: string;
  slug: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseMarkdown(md: string): Row[] {
  const lines = md.split("\n");
  const rows: Row[] = [];
  let section = "";
  let inTable = false;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      section = line.slice(3).trim();
      inTable = false;
      continue;
    }
    if (line.startsWith("|---")) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (!line.startsWith("|")) {
      inTable = false;
      continue;
    }
    const cells = line.split("|").map((c) => c.trim());
    // | Name | Tradition | Lineage | School Affiliation | Country | City | Website |
    if (cells.length < 8) continue;
    const name = cells[1];
    if (name === "Name") continue;
    const tradition = cells[2];
    const schoolAffiliation = cells[4];
    const country = cells[5];
    const city = cells[6];
    const website = cells[7];
    rows.push({
      section,
      name,
      tradition,
      schoolAffiliation,
      country,
      city,
      website,
      slug: slugify(name),
    });
  }
  return rows;
}

function loadExistingSlugs(): Set<string> {
  const a = readFileSync(
    join(process.cwd(), "scripts/data/seed-temples.ts"),
    "utf8",
  );
  const b = readFileSync(
    join(process.cwd(), "scripts/data/seed-temples-europe.ts"),
    "utf8",
  );
  const all = `${a}\n${b}`;
  const slugs = new Set<string>();
  const re = /slug:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(all)) !== null) slugs.add(m[1]);
  return slugs;
}

// Match heuristics — slug exact, or fuzzy by website domain (host without www)
// or by city+country containing the same alphanumeric core. Conservative:
// only flag as "covered" on an exact slug or domain match; everything else is
// reported as candidate-new for manual review.

function loadExistingCorpus(): { slugs: Set<string>; domains: Set<string>; nameTokens: Map<string, string[]> } {
  const a = readFileSync(
    join(process.cwd(), "scripts/data/seed-temples.ts"),
    "utf8",
  );
  const b = readFileSync(
    join(process.cwd(), "scripts/data/seed-temples-europe.ts"),
    "utf8",
  );
  const all = `${a}\n${b}`;
  const slugs = new Set<string>();
  const domains = new Set<string>();
  const nameTokens = new Map<string, string[]>();

  const slugRe = /slug:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = slugRe.exec(all)) !== null) slugs.add(m[1]);

  const urlRe = /url:\s*"([^"]+)"/g;
  while ((m = urlRe.exec(all)) !== null) {
    try {
      const u = new URL(m[1]);
      const host = u.hostname.replace(/^www\./, "");
      domains.add(host);
    } catch {
      // ignore
    }
  }

  return { slugs, domains, nameTokens };
}

function normalizeWebsite(w: string): string {
  return w.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase();
}

function main(): void {
  const md = readFileSync(
    join(process.cwd(), "scripts/data/raw/gemini-temples-global-2026-05-06.md"),
    "utf8",
  );
  const rows = parseMarkdown(md);
  const { slugs, domains } = loadExistingCorpus();

  const bySection = new Map<string, { newRows: Row[]; coveredRows: Row[] }>();
  for (const r of rows) {
    if (!bySection.has(r.section))
      bySection.set(r.section, { newRows: [], coveredRows: [] });
    const bucket = bySection.get(r.section)!;
    const dom = normalizeWebsite(r.website);
    const isCovered = slugs.has(r.slug) || (dom && domains.has(dom));
    if (isCovered) bucket.coveredRows.push(r);
    else bucket.newRows.push(r);
  }

  let totalNew = 0;
  let totalCovered = 0;
  for (const [section, { newRows, coveredRows }] of bySection) {
    const nw = newRows.length;
    const cv = coveredRows.length;
    totalNew += nw;
    totalCovered += cv;
    console.log(`\n## ${section}`);
    console.log(`  covered: ${cv}  |  new: ${nw}`);
    if (nw > 0) {
      console.log(`  NEW:`);
      for (const r of newRows) {
        console.log(
          `    - [${r.country}] ${r.name} (${r.city})  →  ${r.website}  [slug: ${r.slug}]`,
        );
      }
    }
  }
  console.log(`\n---\nTOTAL: ${rows.length} rows  |  covered: ${totalCovered}  |  new: ${totalNew}`);
}

main();
