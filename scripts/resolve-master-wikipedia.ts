/**
 * Resolve master slugs to canonical Wikipedia article URLs, for the `sameAs`
 * field of each master's Person JSON-LD.
 *
 * `sameAs` is how a search engine reconciles the string on our page with the
 * real-world entity it already knows. That only helps if the link is right —
 * pointing at the wrong article actively misinforms, so this script verifies
 * every title against the API and drops anything it cannot confirm, rather
 * than emitting a plausible guess.
 *
 * Seed data is truth: the output is committed to
 * scripts/data/master-wikipedia.json and read at build time. Nothing here
 * runs during a deploy — re-run it by hand when adding masters.
 *
 * Run:  npx tsx scripts/resolve-master-wikipedia.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { createClient } from "@libsql/client";

// Lives under src/ so the app can import it directly — it is render-time
// config for JSON-LD, not DB seed data, and a single copy avoids the two
// drifting apart.
const OUT_PATH = "src/lib/seo/master-wikipedia.json";
const SOURCE_SCRIPT = "scripts/fetch-kv-images.ts";
const API = "https://en.wikipedia.org/w/api.php";
const USER_AGENT =
  "zenlineage.org-research/1.0 (https://zenlineage.org)";

/**
 * The master→Wikipedia-title candidates already curated by hand for the
 * image pipeline. Reusing them keeps a single hand-checked mapping rather
 * than inventing a second one that could drift out of agreement.
 */
function loadCandidates(): Map<string, string[]> {
  const src = readFileSync(SOURCE_SCRIPT, "utf-8");
  const start = src.indexOf("const TARGETS");
  const end = src.indexOf("\n};", start);
  if (start < 0 || end < 0) {
    throw new Error(`could not locate TARGETS in ${SOURCE_SCRIPT}`);
  }
  const block = src.slice(start, end);
  const out = new Map<string, string[]>();
  for (const m of block.matchAll(/^\s*"?([a-z0-9-]+)"?:\s*\[([^\]]*)\]/gm)) {
    const titles = [...m[2].matchAll(/"([^"]+)"/g)].map((t) => t[1]);
    if (titles.length > 0) out.set(m[1], titles);
  }
  return out;
}

interface WikiPage {
  missing?: string;
  title: string;
  fullurl?: string;
  pageprops?: { disambiguation?: string };
}

/**
 * Resolve one title. Returns the canonical URL, or null when the article is
 * missing or is a disambiguation page — a disambiguation link is not an
 * entity identifier and would be worse than no `sameAs` at all.
 */
async function resolve(title: string): Promise<string | null> {
  const url =
    `${API}?action=query&format=json&prop=info|pageprops&inprop=url` +
    `&redirects=1&ppprop=disambiguation&titles=${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    query?: { pages?: Record<string, WikiPage> };
  };
  const pages = Object.values(body.query?.pages ?? {});
  const page = pages[0];
  if (!page || page.missing !== undefined) return null;
  if (page.pageprops?.disambiguation !== undefined) return null;
  return page.fullurl ?? null;
}

interface DbMaster {
  slug: string;
  name: string;
  birthYear: number | null;
  deathYear: number | null;
}

async function loadPublishedMasters(): Promise<DbMaster[]> {
  const client = createClient({ url: "file:zen.db" });
  const rs = await client.execute(`
    SELECT m.slug, m.birth_year, m.death_year,
           COALESCE(
             MAX(CASE WHEN n.name_type = 'dharma' THEN n.value END),
             MAX(n.value)
           ) AS name
      FROM masters m
      LEFT JOIN master_names n
        ON n.master_id = m.id AND n.locale = 'en'
     WHERE m.published = 1
     GROUP BY m.id
  `);
  client.close();
  return rs.rows
    .map((r) => ({
      slug: String(r.slug),
      name: r.name ? String(r.name) : "",
      birthYear: r.birth_year === null ? null : Number(r.birth_year),
      deathYear: r.death_year === null ? null : Number(r.death_year),
    }))
    .filter((m) => m.name.length > 0);
}

/**
 * Confirm an article is about *this* master before claiming identity.
 *
 * Two independent guards, both required. The extract must read as a Buddhist
 * cleric, which rejects same-name articles about unrelated subjects; and a
 * recorded life-year must appear in the extract, which is what separates two
 * monks sharing a dharma name. Masters with no dates cannot clear the second
 * guard and are skipped — `sameAs` pointing at the wrong person is worse than
 * no `sameAs` at all, and this pass has no human in the loop.
 */
const BUDDHIST_HINT =
  /zen|chan|buddhis|s[ōo]t[ōo]|rinzai|seon|s[ŏo]n|thi[ềe]n|obaku|monk|priest|patriarch|abbot/i;

async function extractOf(title: string): Promise<string | null> {
  const url =
    `${API}?action=query&format=json&prop=extracts&exintro=1&explaintext=1` +
    `&redirects=1&titles=${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    query?: { pages?: Record<string, { extract?: string }> };
  };
  return Object.values(body.query?.pages ?? {})[0]?.extract ?? null;
}

/** Lowercase, strip diacritics and punctuation, collapse whitespace. */
function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** The article title a URL resolves to, decoded back from its percent form. */
function titleFromUrl(url: string): string {
  try {
    return decodeURIComponent(url.split("/wiki/")[1] ?? "").replace(/_/g, " ");
  } catch {
    return "";
  }
}

async function resolveByIdentity(m: DbMaster): Promise<string | null> {
  const url = await resolve(m.name);
  if (!url) return null;
  const extract = await extractOf(m.name);
  if (!extract || !BUDDHIST_HINT.test(extract)) return null;

  // Path 1 — a recorded life-year appears in the article. This is what
  // separates two clerics sharing a dharma name.
  const years = [m.birthYear, m.deathYear].filter(
    (y): y is number => y !== null
  );
  if (years.some((y) => extract.includes(String(y)))) return url;

  // Path 2 — the article title *is* the master's name. Figures like
  // Bodhidharma and Huineng have only legendary dates, so they can never
  // clear the year guard, yet an exact title match on a single-name
  // patriarch whose article reads as Buddhist is not ambiguous.
  if (normalizeName(titleFromUrl(url)) === normalizeName(m.name)) return url;

  return null;
}

async function main(): Promise<void> {
  const candidates = loadCandidates();
  console.log(`Resolving ${candidates.size} curated master→Wikipedia titles.`);

  const resolved: Record<string, string> = {};
  const unresolved: string[] = [];

  for (const [slug, titles] of candidates) {
    let hit: string | null = null;
    for (const title of titles) {
      hit = await resolve(title);
      await sleep(120); // courtesy pacing; the API is generous but shared
      if (hit) break;
    }
    if (hit) {
      resolved[slug] = hit;
      console.log(`  ✓ ${slug} → ${hit}`);
    } else {
      unresolved.push(slug);
      console.log(`  ✗ ${slug} — no confirmable article`);
    }
  }

  // Second pass. The curated list was built for the image pipeline and its
  // slugs have drifted from the DB (`sawaki-kodo` is now `kodo-sawaki`, and
  // `muso-soseki` is a different master from the `muso-joko` we hold), so it
  // covers only a fraction of the published set. Rather than hand-remap —
  // which is where wrong-entity links get introduced — resolve from the
  // names the DB actually holds and let the identity guards decide.
  const published = await loadPublishedMasters();
  const known = new Set(Object.keys(resolved));
  const todo = published.filter((m) => !known.has(m.slug));
  console.log(`\nSecond pass: ${todo.length} published masters by name.`);

  let added = 0;
  for (const m of todo) {
    const url = await resolveByIdentity(m);
    await sleep(120);
    if (url) {
      resolved[m.slug] = url;
      added++;
      console.log(`  ✓ ${m.slug} → ${url}`);
    }
  }
  console.log(`  confirmed ${added} of ${todo.length}.`);

  // Drop anything that is not a currently published master: stale curated
  // slugs would sit in the file looking authoritative while matching nothing.
  const publishedSlugs = new Set(published.map((m) => m.slug));
  for (const slug of Object.keys(resolved)) {
    if (!publishedSlugs.has(slug)) {
      delete resolved[slug];
      unresolved.push(`${slug} (not a published master)`);
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(resolved).sort(([a], [b]) => a.localeCompare(b))
  );
  writeFileSync(OUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`);

  console.log(`\n=== Summary ===`);
  console.log(`  resolved:   ${Object.keys(sorted).length} → ${OUT_PATH}`);
  console.log(`  unresolved: ${unresolved.length}`);
  if (unresolved.length > 0) console.log(`    ${unresolved.join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
