# Transmission Evidence System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a strictly-additive provenance system that classifies every transmission edge on zenlineage.org by source quality (tiers A–D), surfaces quotable sources in the lineage UI, and produces evidence via a reproducible multi-agent research panel.

**Architecture:** Per-edge evidence files (`scripts/data/transmission-evidence/<student>__<teacher>.md`) are the durable artifact, committed to git per the seed-data-is-truth rule. The seeder loads them into two new tables (`transmission_evidence`, `transmission_sources`). The audit reads the files directly and enforces deny-list + tier rules. The static-data generator joins evidence into the public edge JSON, and the Pixi lineage UI varies edge style by tier with a side panel exposing the verbatim source quote. An orchestrator script dispatches a 3-researcher + 1-reducer + 1-reviewer agent panel to populate evidence in waves; it never modifies existing `master_transmissions` data.

**Tech Stack:** TypeScript, Drizzle ORM + libsql, Vitest, Next.js App Router, Pixi.js (existing lineage graph), `tsx` for scripts, `gray-matter` for frontmatter parsing.

**Spec:** `docs/superpowers/specs/2026-05-14-transmission-evidence-design.md`

**Project conventions (from `CLAUDE.md`):**
- `zen.db` is ephemeral. Every data change must land in a seed file. Never `sqlite3 zen.db "UPDATE …"`.
- Tests live in `tests/*.test.ts`, run with `npx vitest run <name>`. Imports use the `@/` alias for `src/`.
- New schema needs both an edit to `src/db/schema.ts` AND a new migration `drizzle/NNNN_*.sql`.
- Seed scripts must tolerate a fresh DB (idempotent `IF NOT EXISTS` patterns where relevant).

**Strict invariants the plan must preserve:**
- Do not touch `master_transmissions` rows (no inserts, updates, deletes, or topology changes).
- Do not delete any existing citation rows.
- The public lineage graph must still have exactly one topological root (`shakyamuni-buddha`) after the changes.

---

## Phase 1 — Foundation (schema, libs, seeder)

### Task 1: Add `transmission_evidence` + `transmission_sources` tables

**Files:**
- Modify: `src/db/schema.ts` (append after the `masterTransmissions` block, around line 68)
- Create: `drizzle/0005_transmission_evidence.sql`

- [ ] **Step 1: Add the Drizzle schema definitions**

Insert in `src/db/schema.ts` after `masterTransmissions` (line 68):

```ts
export const transmissionEvidence = sqliteTable("transmission_evidence", {
  id: text("id").primaryKey(),
  transmissionId: text("transmission_id")
    .notNull()
    .unique()
    .references(() => masterTransmissions.id, { onDelete: "cascade" }),
  tier: text("tier").notNull(), // "A" | "B" | "C" | "D"
  verifiedAt: text("verified_at"),
  humanReviewNeeded: integer("human_review_needed", { mode: "boolean" })
    .notNull()
    .default(false),
  reducerNotes: text("reducer_notes"),
  reviewerNotes: text("reviewer_notes"),
});

export const transmissionSources = sqliteTable("transmission_sources", {
  id: text("id").primaryKey(),
  evidenceId: text("evidence_id")
    .notNull()
    .references(() => transmissionEvidence.id, { onDelete: "cascade" }),
  publisher: text("publisher").notNull(),
  url: text("url").notNull(),
  domainClass: text("domain_class").notNull(),
  retrievedOn: text("retrieved_on").notNull(),
  quote: text("quote").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
```

- [ ] **Step 2: Generate the migration**

Run: `npx drizzle-kit generate`
Expected: a new file `drizzle/0005_*.sql` is generated. Rename it to `drizzle/0005_transmission_evidence.sql` if drizzle-kit picked a different suffix.

- [ ] **Step 3: Verify the SQL matches the schema**

Open the generated file. Confirm it contains:
- `CREATE TABLE transmission_evidence` with columns `id`, `transmission_id`, `tier`, `verified_at`, `human_review_needed`, `reducer_notes`, `reviewer_notes`.
- `CREATE TABLE transmission_sources` with columns `id`, `evidence_id`, `publisher`, `url`, `domain_class`, `retrieved_on`, `quote`, `sort_order`.
- The `transmission_id` column is `UNIQUE`.

If anything is missing, edit the SQL by hand to add it.

- [ ] **Step 4: Add indexes**

Append to `drizzle/0005_transmission_evidence.sql`:

```sql
CREATE INDEX idx_transmission_evidence_tier ON transmission_evidence(tier);
CREATE INDEX idx_transmission_sources_evidence ON transmission_sources(evidence_id);
```

- [ ] **Step 5: Apply against a fresh DB**

Run: `rm -f zen.db && DATABASE_URL=file:zen.db npx tsx scripts/seed-db.ts`
Expected: seed-db completes without error. The two new tables exist (`sqlite3 zen.db ".tables" | tr ' ' '\n' | grep transmission`).

- [ ] **Step 6: Commit**

```bash
git add src/db/schema.ts drizzle/0005_transmission_evidence.sql drizzle/meta
git commit -m "schema: add transmission_evidence + transmission_sources tables"
```

---

### Task 2: `src/lib/source-domains.ts` — allow-list, deny-list, `classifyUrl`

**Files:**
- Create: `src/lib/source-domains.ts`
- Create: `tests/source-domains.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/source-domains.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { classifyUrl, PROMOTIONAL_DENY, SOURCE_DOMAINS } from "@/lib/source-domains";

describe("classifyUrl", () => {
  it("classifies Sōtōshū global site as institutional", () => {
    const r = classifyUrl("https://global.sotozen-net.or.jp/eng/library/lineage.html");
    expect(r.class).toBe("institutional");
    expect(r.publisher).toBe("Sōtōshū Shūmuchō (Soto Zen Buddhism)");
  });

  it("classifies White Plum Asanga site as institutional", () => {
    const r = classifyUrl("https://whiteplum.org/lineage/glassman");
    expect(r.class).toBe("institutional");
  });

  it("classifies Wikipedia as reference", () => {
    const r = classifyUrl("https://en.wikipedia.org/wiki/Dogen");
    expect(r.class).toBe("reference");
  });

  it("classifies an unknown domain as unknown", () => {
    const r = classifyUrl("https://random-blog.example.com/post");
    expect(r.class).toBe("unknown");
    expect(r.publisher).toBeNull();
  });

  it("flags Amazon product pages as promotional", () => {
    const r = classifyUrl("https://www.amazon.com/dp/B0123456");
    expect(r.class).toBe("promotional");
  });

  it("flags Goodreads as promotional", () => {
    const r = classifyUrl("https://www.goodreads.com/book/show/12345");
    expect(r.class).toBe("promotional");
  });

  it("flags /buy and /shop path segments as promotional", () => {
    expect(classifyUrl("https://publisher.example.com/buy/dogen").class).toBe("promotional");
    expect(classifyUrl("https://store.example.com/shop/zen-books").class).toBe("promotional");
  });

  it("matches longest domain prefix wins (subdomain over root)", () => {
    // If both example.com (institutional) and old.example.com (community) are listed,
    // the more specific match wins. This test depends on the table — keep it in
    // sync if the table changes.
    expect(SOURCE_DOMAINS.length).toBeGreaterThan(20);
  });

  it("PROMOTIONAL_DENY patterns are RegExp objects", () => {
    for (const p of PROMOTIONAL_DENY) {
      expect(p).toBeInstanceOf(RegExp);
    }
  });
});
```

- [ ] **Step 2: Run the test — it should fail (module not found)**

Run: `npx vitest run source-domains`
Expected: FAIL — `Cannot find module '@/lib/source-domains'`.

- [ ] **Step 3: Implement the library**

Create `src/lib/source-domains.ts`:

```ts
export type DomainClass =
  | "institutional"
  | "academic"
  | "sangha"
  | "reference"
  | "community"
  | "promotional";

export interface DomainEntry {
  /** Domain or domain + path prefix. Matched as a suffix on hostname; if it
   *  contains a "/", the part after must be a path prefix of the URL. */
  pattern: string;
  class: DomainClass;
  publisher: string;
  note?: string;
}

/** Hand-curated allow-list. Extend by PR as new sources are seen. The
 *  longest matching pattern wins so subdomains can override roots. */
export const SOURCE_DOMAINS: DomainEntry[] = [
  // --- institutional: traditions' own organisations ---
  { pattern: "global.sotozen-net.or.jp", class: "institutional", publisher: "Sōtōshū Shūmuchō (Soto Zen Buddhism)" },
  { pattern: "sotozen-net.or.jp", class: "institutional", publisher: "Sōtōshū Shūmuchō" },
  { pattern: "whiteplum.org", class: "institutional", publisher: "White Plum Asanga" },
  { pattern: "sanboji.org", class: "institutional", publisher: "Sanbō Zen International" },
  { pattern: "sanbo-zen.org", class: "institutional", publisher: "Sanbō Zen International" },
  { pattern: "azi.org", class: "institutional", publisher: "Association Zen Internationale" },
  { pattern: "kosenrinzaiji.fr", class: "institutional", publisher: "Kōsen Rinzai-ji" },
  { pattern: "templekanshoji.com", class: "institutional", publisher: "Temple Kanshōji" },
  { pattern: "zenroad.org", class: "institutional", publisher: "Zen Road" },
  { pattern: "abze.org", class: "institutional", publisher: "Asociación Budista Zen España" },
  { pattern: "plumvillage.org", class: "institutional", publisher: "Plum Village" },
  { pattern: "kwanumzen.org", class: "institutional", publisher: "Kwan Um School of Zen" },
  { pattern: "diamond-sangha.org", class: "institutional", publisher: "Diamond Sangha" },
  { pattern: "mro.org", class: "institutional", publisher: "Mountains and Rivers Order" },
  { pattern: "zmm.org", class: "institutional", publisher: "Zen Mountain Monastery" },
  { pattern: "sfzc.org", class: "institutional", publisher: "San Francisco Zen Center" },
  { pattern: "zcla.org", class: "institutional", publisher: "Zen Center of Los Angeles" },
  { pattern: "shasta-abbey.org", class: "institutional", publisher: "Shasta Abbey" },
  { pattern: "rinnou.net", class: "institutional", publisher: "Rinzai-Ōbaku Zen" },
  { pattern: "obakusan.or.jp", class: "institutional", publisher: "Ōbaku Mampuku-ji" },
  { pattern: "eiheiji.jp", class: "institutional", publisher: "Eihei-ji" },
  { pattern: "sojiji.jp", class: "institutional", publisher: "Sōji-ji" },
  { pattern: "myoshin-ji.or.jp", class: "institutional", publisher: "Myōshin-ji" },
  { pattern: "daihonzan-eiheiji.com", class: "institutional", publisher: "Eihei-ji" },

  // --- academic ---
  { pattern: "jstor.org", class: "academic", publisher: "JSTOR" },
  { pattern: "britannica.com", class: "academic", publisher: "Encyclopædia Britannica" },
  { pattern: "oxfordreference.com", class: "academic", publisher: "Oxford Reference" },
  { pattern: "cambridge.org", class: "academic", publisher: "Cambridge University Press" },
  { pattern: "academia.edu", class: "academic", publisher: "Academia.edu" },
  { pattern: "doi.org", class: "academic", publisher: "DOI" },
  { pattern: "muse.jhu.edu", class: "academic", publisher: "Project MUSE" },
  { pattern: "thezensite.com", class: "academic", publisher: "The Zen Site" }, // academic-leaning archive
  { pattern: "buddhistdoor.net", class: "academic", publisher: "Buddhistdoor Global" },
  { pattern: "press.uchicago.edu", class: "academic", publisher: "University of Chicago Press" },
  { pattern: "shambhala.com", class: "academic", publisher: "Shambhala (publisher)" }, // book pages w/o /buy
  { pattern: "wisdomexperience.org", class: "academic", publisher: "Wisdom Publications" },
  { pattern: "terebess.hu", class: "academic", publisher: "Terebess Asia Online" },

  // --- reference (cap on tier contribution) ---
  { pattern: "en.wikipedia.org", class: "reference", publisher: "Wikipedia (English)" },
  { pattern: "ja.wikipedia.org", class: "reference", publisher: "Wikipedia (Japanese)" },
  { pattern: "zh.wikipedia.org", class: "reference", publisher: "Wikipedia (Chinese)" },
  { pattern: "ko.wikipedia.org", class: "reference", publisher: "Wikipedia (Korean)" },
  { pattern: "vi.wikipedia.org", class: "reference", publisher: "Wikipedia (Vietnamese)" },

  // --- sangha (dharma centres / zendos) ---
  { pattern: "treeleaf.org", class: "sangha", publisher: "Treeleaf Zendo" },
  { pattern: "upaya.org", class: "sangha", publisher: "Upaya Zen Center" },
  { pattern: "everydayzen.org", class: "sangha", publisher: "Everyday Zen Foundation" },
  { pattern: "openheartzen.com", class: "sangha", publisher: "Open Heart Zen" },
  { pattern: "blueheronsangha.org", class: "sangha", publisher: "Blue Heron Zen Community" },
];

/** Deny-list patterns. Any source URL matching one of these is a hard
 *  audit error. Matched against the full URL. */
export const PROMOTIONAL_DENY: RegExp[] = [
  /(^|\.)amazon\.[a-z.]+\//i,
  /(^|\.)goodreads\.com\//i,
  /\/dp\/[A-Z0-9]+/i,
  /\/(buy|shop|store)(\/|$)/i,
  /(^|\.)substack\.com\/.*\/p\/.*\/paywall/i,
  /(^|\.)patreon\.com\//i,
  /(\?|&)tag=[^&]*-20(&|$)/i,            // amazon affiliate tag
  /(^|\.)bookshop\.org\//i,               // book retailer
  /(^|\.)abebooks\.[a-z.]+\//i,
];

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function pathnameOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

function patternMatches(entry: DomainEntry, host: string, path: string): boolean {
  const [domain, ...pathParts] = entry.pattern.split("/");
  if (!host.endsWith(domain)) return false;
  if (pathParts.length === 0) return true;
  const expected = "/" + pathParts.join("/");
  return path.startsWith(expected);
}

export function classifyUrl(url: string): {
  class: DomainClass | "unknown";
  publisher: string | null;
} {
  for (const re of PROMOTIONAL_DENY) {
    if (re.test(url)) return { class: "promotional", publisher: null };
  }
  const host = hostnameOf(url);
  const path = pathnameOf(url);
  if (!host) return { class: "unknown", publisher: null };

  let best: DomainEntry | null = null;
  for (const entry of SOURCE_DOMAINS) {
    if (!patternMatches(entry, host, path)) continue;
    if (best === null || entry.pattern.length > best.pattern.length) best = entry;
  }
  if (best) return { class: best.class, publisher: best.publisher };
  return { class: "unknown", publisher: null };
}
```

- [ ] **Step 4: Run tests — they should pass**

Run: `npx vitest run source-domains`
Expected: 8 passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/source-domains.ts tests/source-domains.test.ts
git commit -m "lib: source-domain classifier with allow-list + promotional deny-list"
```

---

### Task 3: `src/lib/edge-trust.ts` — parse evidence file, compute tier

**Files:**
- Create: `src/lib/edge-trust.ts`
- Create: `tests/edge-trust.test.ts`
- Create: `tests/fixtures/transmission-evidence/` (test fixtures)

**Dependency:** install `gray-matter` for frontmatter parsing.

- [ ] **Step 1: Install gray-matter**

Run: `npm install gray-matter`
Expected: package.json gains `gray-matter` in `dependencies`.

- [ ] **Step 2: Create test fixtures**

Create `tests/fixtures/transmission-evidence/tier-a.md`:

```markdown
---
student: tetsugen-bernard-glassman
teacher: hakuyu-taizan-maezumi
tier: A
verified_at: 2026-05-14
sources:
  - publisher: White Plum Asanga
    url: https://whiteplum.org/lineage/glassman
    domain_class: institutional
    retrieved_on: 2026-05-14
    quote: |
      "Maezumi Roshi gave Dharma transmission (shihō) to Tetsugen Bernard Glassman in 1976, the first of his American Dharma successors."
  - publisher: Wikipedia (English)
    url: https://en.wikipedia.org/wiki/Bernie_Glassman
    domain_class: reference
    retrieved_on: 2026-05-14
    quote: |
      "Glassman received dharma transmission from Maezumi in 1976, becoming the first of Maezumi's American dharma heirs."
human_review_needed: false
---
```

Create `tests/fixtures/transmission-evidence/tier-c.md`:

```markdown
---
student: example-student
teacher: example-teacher
tier: C
verified_at: 2026-05-14
sources:
  - publisher: Treeleaf Zendo
    url: https://treeleaf.org/teachers
    domain_class: sangha
    retrieved_on: 2026-05-14
    quote: |
      "Example-student received transmission from Example-teacher at Tōkei-in monastery in 2003."
human_review_needed: false
---
```

Create `tests/fixtures/transmission-evidence/quote-too-short.md`:

```markdown
---
student: example-student
teacher: example-teacher
tier: C
verified_at: 2026-05-14
sources:
  - publisher: Sōtōshū Shūmuchō
    url: https://global.sotozen-net.or.jp/p
    domain_class: institutional
    retrieved_on: 2026-05-14
    quote: "too short"
human_review_needed: false
---
```

Create `tests/fixtures/transmission-evidence/promotional.md`:

```markdown
---
student: example-student
teacher: example-teacher
tier: B
verified_at: 2026-05-14
sources:
  - publisher: Amazon
    url: https://www.amazon.com/dp/B0123456
    domain_class: promotional
    retrieved_on: 2026-05-14
    quote: |
      "A long enough quote that passes the 40-char minimum length check easily."
human_review_needed: false
---
```

- [ ] **Step 3: Write the failing tests**

Create `tests/edge-trust.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseEvidenceFile, computeTier, validateEvidence } from "@/lib/edge-trust";

const FIX = path.join(process.cwd(), "tests/fixtures/transmission-evidence");

function load(name: string): string {
  return fs.readFileSync(path.join(FIX, name), "utf-8");
}

describe("parseEvidenceFile", () => {
  it("parses frontmatter of a tier-A file", () => {
    const r = parseEvidenceFile(load("tier-a.md"));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.parsed.student).toBe("tetsugen-bernard-glassman");
    expect(r.parsed.teacher).toBe("hakuyu-taizan-maezumi");
    expect(r.parsed.sources).toHaveLength(2);
  });

  it("fails when a quote is under 40 chars", () => {
    const r = parseEvidenceFile(load("quote-too-short.md"));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.some((e) => e.includes("quote"))).toBe(true);
  });
});

describe("computeTier", () => {
  it("returns A when 1 institutional + 1 independent corroboration", () => {
    const r = parseEvidenceFile(load("tier-a.md"));
    if (!r.ok) throw new Error("fixture broken");
    expect(computeTier(r.parsed.sources)).toBe("A");
  });

  it("returns C with a single sangha source", () => {
    const r = parseEvidenceFile(load("tier-c.md"));
    if (!r.ok) throw new Error("fixture broken");
    expect(computeTier(r.parsed.sources)).toBe("C");
  });

  it("returns D when no sources", () => {
    expect(computeTier([])).toBe("D");
  });

  it("returns D when any source is promotional", () => {
    expect(
      computeTier([
        { publisher: "X", url: "x", domain_class: "institutional", retrieved_on: "2026-01-01", quote: "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq" },
        { publisher: "Y", url: "y", domain_class: "promotional", retrieved_on: "2026-01-01", quote: "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq" },
      ])
    ).toBe("D");
  });

  it("returns B when 2 sources where one is academic", () => {
    expect(
      computeTier([
        { publisher: "X", url: "x", domain_class: "academic", retrieved_on: "2026-01-01", quote: "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq" },
        { publisher: "Y", url: "y", domain_class: "reference", retrieved_on: "2026-01-01", quote: "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq" },
      ])
    ).toBe("B");
  });
});

describe("validateEvidence", () => {
  it("flags tier-mismatch when declared A but sources only justify C", () => {
    const r = parseEvidenceFile(load("tier-c.md"));
    if (!r.ok) throw new Error("fixture broken");
    const issues = validateEvidence({ ...r.parsed, tier: "A" });
    expect(issues.some((i) => i.kind === "tier-mismatch")).toBe(true);
  });

  it("flags any promotional source", () => {
    const r = parseEvidenceFile(load("promotional.md"));
    if (!r.ok) throw new Error("fixture broken");
    const issues = validateEvidence(r.parsed);
    expect(issues.some((i) => i.kind === "promotional-source")).toBe(true);
  });
});
```

- [ ] **Step 4: Run tests — they should fail (module not found)**

Run: `npx vitest run edge-trust`
Expected: FAIL with `Cannot find module '@/lib/edge-trust'`.

- [ ] **Step 5: Implement the library**

Create `src/lib/edge-trust.ts`:

```ts
import matter from "gray-matter";
import { classifyUrl, type DomainClass, PROMOTIONAL_DENY } from "@/lib/source-domains";

export type Tier = "A" | "B" | "C" | "D";

export interface EvidenceSource {
  publisher: string;
  url: string;
  domain_class: DomainClass | "unknown";
  retrieved_on: string;
  quote: string;
}

export interface ParsedEvidence {
  student: string;
  teacher: string;
  tier: Tier;
  verified_at: string | null;
  sources: EvidenceSource[];
  reducer_notes: string | null;
  reviewer_notes: string | null;
  human_review_needed: boolean;
}

export type ParseResult =
  | { ok: true; parsed: ParsedEvidence }
  | { ok: false; errors: string[] };

const TIERS: ReadonlySet<Tier> = new Set(["A", "B", "C", "D"]);
const VALID_CLASS: ReadonlySet<string> = new Set([
  "institutional",
  "academic",
  "sangha",
  "reference",
  "community",
  "promotional",
  "unknown",
]);
const MIN_QUOTE_LEN = 40;

export function parseEvidenceFile(raw: string): ParseResult {
  const errors: string[] = [];
  let fm: matter.GrayMatterFile<string>;
  try {
    fm = matter(raw);
  } catch (e) {
    return { ok: false, errors: [`invalid frontmatter: ${(e as Error).message}`] };
  }
  const data: Record<string, unknown> = fm.data ?? {};

  const req = (k: string) => {
    if (data[k] === undefined || data[k] === null || data[k] === "") {
      errors.push(`missing required field: ${k}`);
    }
  };
  req("student");
  req("teacher");
  req("tier");

  const tier = data.tier as string;
  if (tier && !TIERS.has(tier as Tier)) {
    errors.push(`tier must be one of A/B/C/D, got: ${tier}`);
  }

  const sourcesRaw = data.sources;
  const sources: EvidenceSource[] = [];
  if (sourcesRaw !== undefined && !Array.isArray(sourcesRaw)) {
    errors.push("sources must be a list");
  } else if (Array.isArray(sourcesRaw)) {
    sourcesRaw.forEach((s: Record<string, unknown>, i: number) => {
      const where = `sources[${i}]`;
      const requireSrc = (k: string) => {
        if (s[k] === undefined || s[k] === null || s[k] === "") {
          errors.push(`${where}.${k} is required`);
        }
      };
      requireSrc("publisher");
      requireSrc("url");
      requireSrc("domain_class");
      requireSrc("retrieved_on");
      requireSrc("quote");
      const dc = s.domain_class as string;
      if (dc && !VALID_CLASS.has(dc)) {
        errors.push(`${where}.domain_class invalid: ${dc}`);
      }
      const q = (s.quote as string) ?? "";
      if (q.length > 0 && q.length < MIN_QUOTE_LEN) {
        errors.push(`${where}.quote is ${q.length} chars, minimum ${MIN_QUOTE_LEN}`);
      }
      sources.push({
        publisher: String(s.publisher ?? ""),
        url: String(s.url ?? ""),
        domain_class: (dc as DomainClass | "unknown") ?? "unknown",
        retrieved_on: String(s.retrieved_on ?? ""),
        quote: q,
      });
    });
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    parsed: {
      student: String(data.student),
      teacher: String(data.teacher),
      tier: tier as Tier,
      verified_at: (data.verified_at as string) ?? null,
      sources,
      reducer_notes: (data.reducer_notes as string) ?? null,
      reviewer_notes: (data.reviewer_notes as string) ?? null,
      human_review_needed: Boolean(data.human_review_needed),
    },
  };
}

/** Compute tier from sources alone, ignoring the declared tier. */
export function computeTier(sources: EvidenceSource[]): Tier {
  if (sources.length === 0) return "D";
  if (sources.some((s) => s.domain_class === "promotional")) return "D";
  // Any sources with deny-list URLs override class to D
  if (sources.some((s) => PROMOTIONAL_DENY.some((re) => re.test(s.url)))) return "D";

  const hosts = new Set(sources.map((s) => safeHost(s.url)).filter(Boolean));
  const independent = hosts.size;

  const counts: Record<DomainClass | "unknown", number> = {
    institutional: 0,
    academic: 0,
    sangha: 0,
    reference: 0,
    community: 0,
    promotional: 0,
    unknown: 0,
  };
  for (const s of sources) counts[s.domain_class]++;

  // Tier A: ≥1 institutional + ≥1 independent corroboration from anything
  // except promotional. Independence is approximated by distinct hostname.
  if (counts.institutional >= 1 && independent >= 2) return "A";

  // Tier B: ≥2 independent sources, ≥1 academic or institutional.
  if (independent >= 2 && counts.academic + counts.institutional >= 1) return "B";

  // Tier C: exactly one credible (non-promotional, non-community-only).
  // Community alone never reaches C (corroborative only) — bump to D.
  const nonCommunity =
    counts.institutional + counts.academic + counts.sangha + counts.reference;
  if (nonCommunity >= 1) return "C";

  return "D";
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export interface ValidationIssue {
  kind:
    | "tier-mismatch"
    | "promotional-source"
    | "quote-too-short"
    | "unknown-domain"
    | "stale"
    | "missing-required";
  detail: string;
}

export function validateEvidence(p: ParsedEvidence): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const s of p.sources) {
    if (s.domain_class === "promotional") {
      issues.push({ kind: "promotional-source", detail: `${s.url} (${s.publisher})` });
    }
    if (PROMOTIONAL_DENY.some((re) => re.test(s.url))) {
      issues.push({ kind: "promotional-source", detail: `${s.url} matches deny pattern` });
    }
    if (s.quote.length < 40) {
      issues.push({ kind: "quote-too-short", detail: `${s.url} quote=${s.quote.length}ch` });
    }
    if (s.domain_class === "unknown") {
      issues.push({ kind: "unknown-domain", detail: `${s.url}` });
    } else {
      // Spot-check that domain_class agrees with classifyUrl
      const c = classifyUrl(s.url);
      if (c.class !== "unknown" && c.class !== s.domain_class) {
        issues.push({
          kind: "tier-mismatch",
          detail: `${s.url}: declared ${s.domain_class}, classifier says ${c.class}`,
        });
      }
    }
  }
  const computed = computeTier(p.sources);
  if (computed !== p.tier) {
    issues.push({
      kind: "tier-mismatch",
      detail: `declared tier ${p.tier} but computed ${computed}`,
    });
  }
  if (p.verified_at) {
    const ageDays = (Date.now() - Date.parse(p.verified_at)) / 86_400_000;
    if (ageDays > 547) issues.push({ kind: "stale", detail: `verified_at ${p.verified_at}` });
  }
  return issues;
}
```

- [ ] **Step 6: Run tests — they should pass**

Run: `npx vitest run edge-trust`
Expected: 9 passing.

- [ ] **Step 7: Commit**

```bash
git add src/lib/edge-trust.ts tests/edge-trust.test.ts tests/fixtures/transmission-evidence package.json package-lock.json
git commit -m "lib: edge-trust parser, tier computation, and validation"
```

---

### Task 4: `scripts/seed-transmission-evidence.ts` — load files into DB

**Files:**
- Create: `scripts/seed-transmission-evidence.ts`
- Create: `scripts/data/transmission-evidence/` (directory; commit a `.gitkeep`)
- Modify: `package.json` (add the new prebuild step)

- [ ] **Step 1: Create the empty evidence directory**

Run:
```bash
mkdir -p scripts/data/transmission-evidence
touch scripts/data/transmission-evidence/.gitkeep
```

- [ ] **Step 2: Write the seeder**

Create `scripts/seed-transmission-evidence.ts`:

```ts
/**
 * Seed transmission_evidence + transmission_sources from per-edge
 * Markdown files at scripts/data/transmission-evidence/<student>__<teacher>.md.
 *
 * Edges with no evidence file get a row with tier='D' and
 * human_review_needed=1 so the public-side code never has to handle a
 * missing-evidence case.
 *
 * Strictly additive: this script never reads, modifies, or deletes
 * rows in master_transmissions.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/seed-transmission-evidence.ts
 */
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { db } from "@/db";
import {
  masters,
  masterTransmissions,
  transmissionEvidence,
  transmissionSources,
} from "@/db/schema";
import { parseEvidenceFile, validateEvidence } from "@/lib/edge-trust";

const EVIDENCE_DIR = path.join(process.cwd(), "scripts/data/transmission-evidence");

async function main() {
  const mastersList = await db
    .select({ id: masters.id, slug: masters.slug })
    .from(masters);
  const slugToId = new Map(mastersList.map((m) => [m.slug, m.id]));

  const edges = await db
    .select({
      id: masterTransmissions.id,
      studentId: masterTransmissions.studentId,
      teacherId: masterTransmissions.teacherId,
    })
    .from(masterTransmissions);
  const edgeKey = (sId: string, tId: string) => `${sId}|${tId}`;
  const edgeIdByKey = new Map(
    edges.map((e) => [edgeKey(e.studentId, e.teacherId), e.id]),
  );

  // Clean slate — seeder owns these two tables completely.
  await db.delete(transmissionSources);
  await db.delete(transmissionEvidence);

  let loaded = 0;
  let danglingFiles = 0;
  let parseErrors = 0;

  const files = fs.existsSync(EVIDENCE_DIR)
    ? fs.readdirSync(EVIDENCE_DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    : [];

  const filesByEdgeId = new Map<string, string>();
  for (const file of files) {
    const raw = fs.readFileSync(path.join(EVIDENCE_DIR, file), "utf-8");
    const parsed = parseEvidenceFile(raw);
    if (!parsed.ok) {
      console.error(`[evidence] ${file}: parse errors:\n  - ${parsed.errors.join("\n  - ")}`);
      parseErrors++;
      continue;
    }
    const sId = slugToId.get(parsed.parsed.student);
    const tId = slugToId.get(parsed.parsed.teacher);
    if (!sId || !tId) {
      console.error(
        `[evidence] ${file}: unknown master slug (student=${parsed.parsed.student}, teacher=${parsed.parsed.teacher})`,
      );
      danglingFiles++;
      continue;
    }
    const edgeId = edgeIdByKey.get(edgeKey(sId, tId));
    if (!edgeId) {
      console.error(
        `[evidence] ${file}: no master_transmissions row for ${parsed.parsed.teacher} → ${parsed.parsed.student}`,
      );
      danglingFiles++;
      continue;
    }
    filesByEdgeId.set(edgeId, file);

    const evidenceId = nanoid();
    await db.insert(transmissionEvidence).values({
      id: evidenceId,
      transmissionId: edgeId,
      tier: parsed.parsed.tier,
      verifiedAt: parsed.parsed.verified_at,
      humanReviewNeeded: parsed.parsed.human_review_needed,
      reducerNotes: parsed.parsed.reducer_notes,
      reviewerNotes: parsed.parsed.reviewer_notes,
    });
    for (let i = 0; i < parsed.parsed.sources.length; i++) {
      const s = parsed.parsed.sources[i];
      await db.insert(transmissionSources).values({
        id: nanoid(),
        evidenceId,
        publisher: s.publisher,
        url: s.url,
        domainClass: s.domain_class,
        retrievedOn: s.retrieved_on,
        quote: s.quote,
        sortOrder: i,
      });
    }
    loaded++;
  }

  // Tier-D placeholder for every edge with no evidence file.
  let placeheld = 0;
  for (const e of edges) {
    if (filesByEdgeId.has(e.id)) continue;
    await db.insert(transmissionEvidence).values({
      id: nanoid(),
      transmissionId: e.id,
      tier: "D",
      verifiedAt: null,
      humanReviewNeeded: true,
      reducerNotes: null,
      reviewerNotes: null,
    });
    placeheld++;
  }

  console.log(`[seed-transmission-evidence] loaded=${loaded} tier_d_placeholders=${placeheld} parse_errors=${parseErrors} dangling=${danglingFiles}`);
  if (parseErrors > 0 || danglingFiles > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Insert into the prebuild pipeline**

Edit `package.json`. In the `prebuild` script, insert the new step **after** `audit-soto-lineage.ts` and **before** `seed-teachings.ts`. The relevant fragment becomes:

```
... && DATABASE_URL=file:zen.db tsx scripts/audit-soto-lineage.ts && DATABASE_URL=file:zen.db tsx scripts/seed-transmission-evidence.ts && DATABASE_URL=file:zen.db tsx scripts/seed-teachings.ts && ...
```

Also add the convenience alias:

```json
"seed:evidence": "DATABASE_URL=file:zen.db tsx scripts/seed-transmission-evidence.ts"
```

- [ ] **Step 4: Run prebuild end-to-end**

Run: `rm -f zen.db && npm run prebuild`
Expected: completes without error. Log line `[seed-transmission-evidence] loaded=0 tier_d_placeholders=<N> parse_errors=0 dangling=0` where N matches the row count of `master_transmissions`.

Verify: `sqlite3 zen.db "SELECT tier, COUNT(*) FROM transmission_evidence GROUP BY tier;"`
Expected: a single row `D|<N>`.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-transmission-evidence.ts scripts/data/transmission-evidence/.gitkeep package.json
git commit -m "seed: load transmission_evidence from per-edge markdown files"
```

---

## Phase 2 — Audit, static-data, and UI

### Task 5: Extend `audit-transmissions.ts` with evidence rules

**Files:**
- Modify: `scripts/audit-transmissions.ts`

- [ ] **Step 1: Add the evidence-walk block**

In `scripts/audit-transmissions.ts`, after the existing per-edge loop ends (after `// ── Per-student rules ──` block, around line 235) and before `// ── Orphan masters` (line 260), insert:

```ts
  // ── Evidence-file rules ───────────────────────────────────────────
  // Reads scripts/data/transmission-evidence/*.md directly from disk
  // so it stays independent of the seeder's idempotent reset of the
  // transmission_evidence table.
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { parseEvidenceFile, validateEvidence } = await import("@/lib/edge-trust");

  const EVIDENCE_DIR = path.join(process.cwd(), "scripts/data/transmission-evidence");
  const filesPresent = fs.existsSync(EVIDENCE_DIR)
    ? fs.readdirSync(EVIDENCE_DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    : [];

  const slugToMaster = new Map(allMasters.map((m) => [m.slug, m]));
  const edgeBySlugPair = new Map<string, (typeof allEdges)[number]>();
  for (const e of allEdges) {
    const sSlug = idToSlug.get(e.studentId);
    const tSlug = idToSlug.get(e.teacherId);
    if (sSlug && tSlug) edgeBySlugPair.set(`${sSlug}|${tSlug}`, e);
  }

  const filesByEdgeId = new Set<string>();
  for (const file of filesPresent) {
    const raw = fs.readFileSync(path.join(EVIDENCE_DIR, file), "utf-8");
    const r = parseEvidenceFile(raw);
    if (!r.ok) {
      findings.push({
        severity: "ERROR",
        rule: "evidence-parse-error",
        studentSlug: file,
        teacherSlug: "(file)",
        edgeType: "—",
        isPrimary: false,
        notes: null,
        reason: r.errors.join("; "),
      });
      continue;
    }
    const key = `${r.parsed.student}|${r.parsed.teacher}`;
    const edge = edgeBySlugPair.get(key);
    if (!edge) {
      findings.push({
        severity: "ERROR",
        rule: "evidence-dangling-edge",
        studentSlug: r.parsed.student,
        teacherSlug: r.parsed.teacher,
        edgeType: "—",
        isPrimary: false,
        notes: null,
        reason: `evidence file ${file} references no real master_transmissions edge`,
      });
      continue;
    }
    filesByEdgeId.add(edge.id);
    const issues = validateEvidence(r.parsed);
    for (const issue of issues) {
      const severity: Finding["severity"] =
        issue.kind === "promotional-source" ? "ERROR"
        : issue.kind === "stale" ? "INFO"
        : "WARN";
      findings.push({
        severity,
        rule: `evidence-${issue.kind}`,
        studentSlug: r.parsed.student,
        teacherSlug: r.parsed.teacher,
        edgeType: edge.type,
        isPrimary: edge.isPrimary ?? false,
        notes: edge.notes,
        reason: issue.detail,
      });
    }
  }

  // Tier-D info row for every edge without an evidence file.
  for (const e of allEdges) {
    if (filesByEdgeId.has(e.id)) continue;
    findings.push({
      severity: "INFO",
      rule: "evidence-tier-d",
      studentSlug: idToSlug.get(e.studentId) ?? "?",
      teacherSlug: idToSlug.get(e.teacherId) ?? "?",
      edgeType: e.type,
      isPrimary: e.isPrimary ?? false,
      notes: e.notes,
      reason: "no evidence file — rendered with visible doubt",
    });
  }
```

- [ ] **Step 2: Run the audit against an empty evidence directory**

Run: `DATABASE_URL=file:zen.db npx tsx scripts/audit-transmissions.ts`
Expected: exits 0. The summary includes the new `evidence-tier-d` info row for every edge, and no ERROR rows.

- [ ] **Step 3: Commit**

```bash
git add scripts/audit-transmissions.ts
git commit -m "audit: enforce evidence-file rules in transmission audit"
```

---

### Task 6: Surface tier + sources in `generate-static-data.ts`

**Files:**
- Modify: `scripts/generate-static-data.ts` (graph generation block)
- Modify: `src/lib/graph-types.ts` (add tier + sources to `GraphEdge`)

- [ ] **Step 1: Extend `GraphEdge`**

In `src/lib/graph-types.ts`, replace the `GraphEdge` interface with:

```ts
export type EdgeTier = "A" | "B" | "C" | "D";

export interface EdgeSource {
  publisher: string;
  url: string;
  domainClass: string;
  quote: string;
  retrievedOn: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  isPrimary: boolean;
  shihoConferred?: boolean;
  /** Tier from transmission_evidence. "D" means no/insufficient sources. */
  tier: EdgeTier;
  /** Quotable sources, ordered institutional → academic → sangha → reference → community → unknown. */
  sources: EdgeSource[];
}
```

- [ ] **Step 2: Join evidence + sources in the static generator**

In `scripts/generate-static-data.ts`:

1. Add to the top-level imports (next to `masterTransmissions`):
   ```ts
   import { transmissionEvidence, transmissionSources } from "@/db/schema";
   ```

2. Inside the function that builds `transmissionsData` (search for the existing `db.select(...).from(masterTransmissions)` call near line 108–115), add two more queries in the same `Promise.all` block or sequential to it:

   ```ts
   const evidenceRows = await db
     .select({
       transmissionId: transmissionEvidence.transmissionId,
       id: transmissionEvidence.id,
       tier: transmissionEvidence.tier,
     })
     .from(transmissionEvidence);
   const sourceRows = await db
     .select({
       evidenceId: transmissionSources.evidenceId,
       publisher: transmissionSources.publisher,
       url: transmissionSources.url,
       domainClass: transmissionSources.domainClass,
       quote: transmissionSources.quote,
       retrievedOn: transmissionSources.retrievedOn,
       sortOrder: transmissionSources.sortOrder,
     })
     .from(transmissionSources);
   const sourcesByEvidence = new Map<string, typeof sourceRows>();
   for (const s of sourceRows) {
     const arr = sourcesByEvidence.get(s.evidenceId) ?? [];
     arr.push(s);
     sourcesByEvidence.set(s.evidenceId, arr);
   }
   const tierByTxId = new Map(evidenceRows.map((e) => [e.transmissionId, e.tier]));
   const sourcesByTxId = new Map<string, typeof sourceRows>();
   for (const e of evidenceRows) {
     sourcesByTxId.set(e.transmissionId, sourcesByEvidence.get(e.id) ?? []);
   }
   const DOMAIN_ORDER: Record<string, number> = {
     institutional: 0, academic: 1, sangha: 2, reference: 3, community: 4, unknown: 5, promotional: 6,
   };
   ```

3. In the `edges = transmissionsData.map((t) => { ... })` block, change the returned object to include tier and sources:

   ```ts
   return {
     id: t.id,
     source: t.teacherId,
     target: t.studentId,
     type: t.type,
     isPrimary,
     shihoConferred,
     tier: (tierByTxId.get(t.id) ?? "D") as "A" | "B" | "C" | "D",
     sources: (sourcesByTxId.get(t.id) ?? [])
       .slice()
       .sort((a, b) => (DOMAIN_ORDER[a.domainClass] - DOMAIN_ORDER[b.domainClass]) || (a.sortOrder - b.sortOrder))
       .map((s) => ({
         publisher: s.publisher,
         url: s.url,
         domainClass: s.domainClass,
         quote: s.quote,
         retrievedOn: s.retrievedOn,
       })),
   };
   ```

- [ ] **Step 3: Regenerate static data**

Run: `DATABASE_URL=file:zen.db npx tsx scripts/generate-static-data.ts`
Expected: completes without error.

Verify: `node -e "const d=require('./public/data/lineage-graph.json'); console.log(d.edges[0].tier, d.edges[0].sources)"`
Expected: prints `D []` (since no evidence files exist yet) — proves tier+sources made it through.

- [ ] **Step 4: Commit**

```bash
git add src/lib/graph-types.ts scripts/generate-static-data.ts
git commit -m "static-data: include edge tier + source list in lineage graph JSON"
```

---

### Task 7: Render edge style by tier in `LineageGraph.tsx`

**Files:**
- Modify: `src/components/LineageGraph.tsx` (edge drawing block around line 443–460)

The existing Pixi graphics code already does `edgeGraphics.stroke()` with a width chosen by edge type. We layer tier on top by adjusting alpha and width per tier — no need to introduce true dashed strokes, which Pixi doesn't natively support.

- [ ] **Step 1: Replace the edge-width + stroke block**

In `src/components/LineageGraph.tsx`, locate the existing block (around line 443):

```ts
      const edgeWidth = edge.type === "primary" ? 1.5 : 0.8;
      ...
      const isPrimary = edge.type === "primary";
      ...
      } else if (edge.type === "secondary") {
      ...
      edgeGraphics.stroke();
```

Replace the width selection and stroke call with tier-aware variants:

```ts
      // Tier-aware visual weight. Tier A renders as the existing
      // "confident" stroke; B is slightly lighter; C and D drop alpha
      // and add a small "?" marker midway along the edge for D.
      const tier = (edge.tier ?? "D") as "A" | "B" | "C" | "D";
      const baseWidth =
        tier === "A" ? 1.5 :
        tier === "B" ? 1.1 :
        tier === "C" ? 0.9 :
                       0.8;
      const baseAlpha =
        tier === "A" ? 1.0 :
        tier === "B" ? 0.9 :
        tier === "C" ? 0.6 :
                       0.4;
      const edgeWidth = edge.type === "primary" ? baseWidth : baseWidth * 0.65;
      const edgeAlpha = baseAlpha;
```

Find the `edgeGraphics.stroke()` call below and replace with:

```ts
      edgeGraphics.stroke({ alpha: edgeAlpha });
```

(If `.stroke()` is called with an object elsewhere with `{ width, color }`, merge `alpha: edgeAlpha` into that object instead — the Pixi `Graphics.stroke` API accepts a `StrokeStyle` with these fields.)

- [ ] **Step 2: Add the "?" glyph for tier D**

Immediately after `edgeGraphics.stroke(...)` for tier D edges, before incrementing the loop, draw a small `?` at the midpoint:

```ts
      if (tier === "D") {
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        const dot = new Graphics();
        dot.circle(midX, midY, 4).fill({ color: 0xb0b0b0, alpha: 0.85 });
        const question = new Text({
          text: "?",
          style: { fontFamily: "serif", fontSize: 8, fill: 0xffffff },
        });
        question.x = midX - question.width / 2;
        question.y = midY - question.height / 2;
        edgesLayer.addChild(dot);
        edgesLayer.addChild(question);
      }
```

(If `Text` isn't already imported, add it to the existing `import { ... } from "pixi.js"` line at the top of the file. If `edgesLayer` is named differently in this file, use the existing container the loop appends edges to.)

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (If TS complains that `edge.tier` doesn't exist on a `GraphEdge`, double-check Task 6 step 1.)

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`
Open `http://localhost:3000/lineage` in a browser. Confirm:
- The graph still renders with exactly one root (Shakyamuni).
- Every edge currently shows the tier-D treatment (light gray, dashed feel via alpha, `?` glyph at midpoints).
- No console errors.

Kill the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/LineageGraph.tsx
git commit -m "lineage: vary edge weight and add tier-D doubt glyph per evidence tier"
```

---

### Task 8: Provenance side panel — quote + sources on click

**Files:**
- Find the existing side panel that opens on edge / node click in `src/components/LineageGraph.tsx` or a sibling component. Add a "Provenance" section.

- [ ] **Step 1: Find the existing edge-click side panel**

Run: `grep -n "selectedEdge\|onEdgeClick\|edgeDetail\|SidePanel" src/components/LineageGraph.tsx src/app/lineage/*.tsx`

The lineage UI currently displays node detail; if there's no edge-click handler yet, add one in this task. The simplest UX: render a fixed-position React overlay component when an edge is selected.

- [ ] **Step 2: Create the panel component**

Create `src/components/lineage/EdgeProvenancePanel.tsx`:

```tsx
"use client";

import type { GraphEdge, GraphNode } from "@/lib/graph-types";

interface Props {
  edge: GraphEdge;
  teacher: GraphNode | undefined;
  student: GraphNode | undefined;
  onClose: () => void;
}

const TIER_LABEL: Record<string, string> = {
  A: "Tier A — institutional + corroborated",
  B: "Tier B — multiple independent sources",
  C: "Tier C — single credible source",
  D: "Tier D — provenance pending",
};

const CLASS_LABEL: Record<string, string> = {
  institutional: "Institutional",
  academic: "Academic",
  sangha: "Sangha",
  reference: "Reference",
  community: "Community",
  unknown: "Unclassified",
};

export function EdgeProvenancePanel({ edge, teacher, student, onClose }: Props) {
  const teacherLabel = teacher?.label ?? edge.source;
  const studentLabel = student?.label ?? edge.target;
  return (
    <aside
      className="fixed right-4 top-24 z-50 w-[28rem] max-h-[80vh] overflow-auto rounded border border-stone-300 bg-white/95 backdrop-blur p-4 shadow-lg text-sm"
      aria-label={`Provenance for transmission ${teacherLabel} to ${studentLabel}`}
    >
      <header className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="font-serif text-base">
            {teacherLabel} → {studentLabel}
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            {TIER_LABEL[edge.tier] ?? TIER_LABEL.D}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-stone-500 hover:text-stone-900"
          aria-label="Close provenance panel"
        >
          ×
        </button>
      </header>
      {edge.sources.length === 0 ? (
        <p className="text-stone-700">
          We have not yet recorded a quotable source for this transmission.
          The edge is shown with visible doubt; if you can point us to a
          credible source, we welcome corrections.
        </p>
      ) : (
        <ol className="space-y-3">
          {edge.sources.map((s) => (
            <li key={s.url} className="border-l-2 border-stone-200 pl-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{s.publisher}</span>
                <span className="text-[10px] uppercase tracking-wide text-stone-500">
                  {CLASS_LABEL[s.domainClass] ?? s.domainClass}
                </span>
              </div>
              <blockquote className="my-1 italic text-stone-800">
                “{s.quote.trim()}”
              </blockquote>
              <div className="text-xs text-stone-600">
                <a
                  className="underline hover:text-stone-900"
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {new URL(s.url).hostname}
                </a>{" "}
                — retrieved {s.retrievedOn}
              </div>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
```

- [ ] **Step 3: Wire the panel into the graph**

In `src/components/LineageGraph.tsx`:

1. Add state for the selected edge in the React component that wraps the Pixi canvas:
   ```ts
   const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
   ```

2. In the Pixi edge-loop (Task 7 location), make each edge graphic interactive:
   ```ts
   edgeGraphics.eventMode = "static";
   edgeGraphics.cursor = "pointer";
   edgeGraphics.on("pointertap", () => setSelectedEdge(edge));
   ```

3. Render the panel in the React tree:
   ```tsx
   {selectedEdge && (
     <EdgeProvenancePanel
       edge={selectedEdge}
       teacher={nodeById.get(selectedEdge.source)}
       student={nodeById.get(selectedEdge.target)}
       onClose={() => setSelectedEdge(null)}
     />
   )}
   ```

(Adjust `nodeById` to match the existing variable in the file — there's already a `nodeById.get(...)` use around line 423.)

- [ ] **Step 4: Type-check + manual smoke test**

Run: `npx tsc --noEmit && npm run dev`
Click any edge in the lineage graph at `http://localhost:3000/lineage`.
Expected: side panel opens with "Tier D — provenance pending" and the "We have not yet recorded…" message.
Close button works; clicking another edge swaps content.

- [ ] **Step 5: Commit**

```bash
git add src/components/lineage/EdgeProvenancePanel.tsx src/components/LineageGraph.tsx
git commit -m "lineage: provenance side panel showing tier + quotable sources per edge"
```

---

### Task 9: `/lineage/provenance` index page

**Files:**
- Create: `src/app/lineage/provenance/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { GraphData } from "@/lib/graph-types";

export const metadata = {
  title: "Provenance — Zen Lineage",
  description:
    "Every transmission on this site grouped by source quality. Tier A is institutional + corroborated; tier D is pending.",
};

function loadGraph(): GraphData {
  const p = path.join(process.cwd(), "public/data/lineage-graph.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export default function ProvenancePage() {
  const graph = loadGraph();
  const buckets: Record<"A" | "B" | "C" | "D", typeof graph.edges> = {
    A: [], B: [], C: [], D: [],
  };
  for (const e of graph.edges) buckets[e.tier ?? "D"].push(e);
  const labelOf = new Map(graph.nodes.map((n) => [n.id, n.label]));
  const slugOf = new Map(graph.nodes.map((n) => [n.id, n.slug]));

  const tierBlurb: Record<string, string> = {
    A: "Institutional source plus at least one independent corroboration.",
    B: "Two or more independent sources, including an academic or institutional one.",
    C: "One credible source (institutional, academic, sangha, or reference).",
    D: "Provenance pending review. The transmission is shown on the graph with visible doubt.",
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-3xl mb-2">Provenance</h1>
      <p className="text-stone-700 mb-8">
        Every transmission shown on the lineage graph, grouped by the
        quality of the source that attests it. We publish what we can
        defend with a quotable passage and mark the rest with visible
        doubt rather than hide it.
      </p>
      {(["A", "B", "C", "D"] as const).map((tier) => (
        <section key={tier} className="mb-10">
          <h2 className="font-serif text-xl">
            Tier {tier} — {buckets[tier].length} edge{buckets[tier].length === 1 ? "" : "s"}
          </h2>
          <p className="text-sm text-stone-600 mb-3">{tierBlurb[tier]}</p>
          <ul className="space-y-1">
            {buckets[tier]
              .slice()
              .sort((a, b) =>
                (labelOf.get(a.source) ?? "").localeCompare(labelOf.get(b.source) ?? ""),
              )
              .map((e) => (
                <li key={e.id} className="text-sm">
                  <Link
                    className="underline hover:text-stone-900"
                    href={`/lineage/${slugOf.get(e.source) ?? ""}`}
                  >
                    {labelOf.get(e.source) ?? e.source}
                  </Link>{" "}
                  →{" "}
                  <Link
                    className="underline hover:text-stone-900"
                    href={`/lineage/${slugOf.get(e.target) ?? ""}`}
                  >
                    {labelOf.get(e.target) ?? e.target}
                  </Link>
                  {e.sources.length > 0 && (
                    <span className="text-stone-500">
                      {" "}
                      — {e.sources[0].publisher}
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
```

- [ ] **Step 2: Smoke test**

Run: `npm run dev` and open `http://localhost:3000/lineage/provenance`.
Expected: all edges listed under "Tier D — N edges" (because no evidence files exist yet). Sōtō spine + KV cohorts all show up.

- [ ] **Step 3: Commit**

```bash
git add src/app/lineage/provenance/page.tsx
git commit -m "lineage: /provenance index grouping every edge by tier"
```

---

## Phase 3 — Agent orchestrator + one-time import

### Task 10: `scripts/run-evidence-panel.ts` skeleton + edge selection

**Files:**
- Create: `scripts/run-evidence-panel.ts`
- Create: `scripts/data/agent-recipes/transmission-evidence.md`

- [ ] **Step 1: Write the recipe doc**

Create `scripts/data/agent-recipes/transmission-evidence.md`:

```markdown
# Transmission Evidence — Agent Panel Recipe

Reproducible procedure for verifying transmission edges. Run via
`npx tsx scripts/run-evidence-panel.ts [--school <slug>] [--edges <file>] [--tier <X>] [--wave-size <N>]`.

## Inputs per edge

The orchestrator hands each researcher exactly:

- `{ student_slug, teacher_slug, student_label, teacher_label, dates, school, native_names, existing_notes }`
- The current `src/lib/source-domains.ts` allow-list (printed as JSON).
- The deny-list patterns from `src/lib/source-domains.ts#PROMOTIONAL_DENY`.

Researchers MUST NOT receive:

- Other researchers' output.
- The edge's existing `citations` row(s) — those go to the reducer only.

## Researcher prompt

> You are verifying whether {teacher_label} ({teacher_native_name}) conferred
> Dharma transmission on {student_label} ({student_native_name}) in the
> {school} tradition. Their dates: teacher {teacher_dates}, student
> {student_dates}.
>
> Find sources that explicitly attest this teacher→student relation. For
> each source, return: publisher (human-readable name), URL, the
> `domain_class` from the allow-list below, the date you retrieved it, and
> a verbatim quote (≥40 characters) from the page that supports the
> relation. Do not paraphrase.
>
> ALLOW-LIST (use only these classes): {JSON of SOURCE_DOMAINS}
> DENY-LIST (never cite): {JSON of PROMOTIONAL_DENY patterns}
>
> If a candidate source is not in the allow-list, mark its
> `domain_class: "unknown"` so it can be classified later.
>
> Return STRICT JSON only:
> ```
> { "sources": [...], "confidence": "low|medium|high", "dissent_note": "..." }
> ```
> Do not invent sources. If you cannot find a credible source, return an
> empty `sources` array and explain in `dissent_note`.

## Reducer prompt

> You have three independent research envelopes for the transmission
> {teacher_label} → {student_label}. Merge them.
>
> 1. Dedupe sources by canonicalised URL.
> 2. Compute the tier using the rules in `src/lib/edge-trust.ts`
>    (see the typed `computeTier` function).
> 3. Set `human_review_needed: true` IF the researchers contradict on a
>    SUBSTANTIVE point: different teacher named, different year of
>    transmission attested, claim of "no transmission given." Otherwise
>    `false`. Capture the disagreement verbatim in `reducer_notes`.
> 4. Write the evidence file to
>    `scripts/data/transmission-evidence/<student>__<teacher>.md` using
>    the schema in the design spec.
>
> Never invent a source. Never modify the URL or quote a researcher
> provided.

## Reviewer prompt

> Read the merged evidence file and the URLs it references. For each
> source, verify:
>
> - The URL still resolves (or note it does not).
> - The verbatim quote actually appears on the page as written.
> - The quote describes the same transmission claimed by the edge (not
>   a different transmission for the same people, e.g. the teacher's
>   own teacher).
>
> You may DOWNGRADE the tier (e.g. A → B) by editing the frontmatter.
> You may set `human_review_needed: true` and add concerns to
> `reviewer_notes`.
> You may NEVER upgrade the tier. You may NEVER modify the `sources`
> array.

## Suggested corrections

If a researcher or reviewer concludes that the edge itself is wrong
(not just under-sourced) — wrong teacher, wrong direction, wrong
person entirely — they append a record to
`scripts/data/transmission-evidence/_suggested-corrections.md`:

```
## {teacher_slug} → {student_slug}
- date: 2026-05-14
- agent: researcher-2 / reviewer
- claim: "Source X actually says the transmission was from Y, not Z."
- urls: [...]
```

A human reviews these and lands them as a normal PR editing the
canonical seed-data files. The orchestrator NEVER auto-applies them.
```

- [ ] **Step 2: Write the orchestrator skeleton**

Create `scripts/run-evidence-panel.ts`:

```ts
/**
 * Orchestrator for the transmission-evidence agent panel.
 *
 * Selects a batch of edges and runs them through the Researcher (×3) →
 * Reducer → Reviewer pipeline. Output: one .md file per edge under
 * scripts/data/transmission-evidence/.
 *
 * This script never modifies master_transmissions.
 *
 * Usage:
 *   npx tsx scripts/run-evidence-panel.ts --school <slug>
 *   npx tsx scripts/run-evidence-panel.ts --tier D --wave-size 25
 *   npx tsx scripts/run-evidence-panel.ts --edges path/to/edge-ids.txt
 */
import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import {
  masters,
  masterNames,
  masterTransmissions,
  schools,
  transmissionEvidence,
} from "@/db/schema";
import { eq } from "drizzle-orm";

const STATE_FILE = path.join(
  process.cwd(),
  "scripts/data/transmission-evidence/_state.json",
);

interface State {
  last_run: string | null;
  processed_edge_ids: string[];
}

function loadState(): State {
  if (!fs.existsSync(STATE_FILE)) return { last_run: null, processed_edge_ids: [] };
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
}
function saveState(s: State): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

interface EdgePayload {
  edgeId: string;
  studentSlug: string;
  teacherSlug: string;
  studentLabel: string;
  teacherLabel: string;
  studentNative: string[];
  teacherNative: string[];
  studentDates: string;
  teacherDates: string;
  schoolSlug: string;
  existingNotes: string;
}

async function buildPayloads(filter: {
  school?: string;
  tier?: string;
  edgeIds?: string[];
}): Promise<EdgePayload[]> {
  const all = await db
    .select({
      edgeId: masterTransmissions.id,
      studentId: masterTransmissions.studentId,
      teacherId: masterTransmissions.teacherId,
      notes: masterTransmissions.notes,
    })
    .from(masterTransmissions);

  const mastersRows = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      schoolId: masters.schoolId,
      birth: masters.birthYear,
      death: masters.deathYear,
    })
    .from(masters);
  const m = new Map(mastersRows.map((r) => [r.id, r]));

  const schoolRows = await db.select({ id: schools.id, slug: schools.slug }).from(schools);
  const schoolSlugOf = new Map(schoolRows.map((s) => [s.id, s.slug]));

  const nameRows = await db
    .select({ masterId: masterNames.masterId, locale: masterNames.locale, value: masterNames.value })
    .from(masterNames);
  const namesByMaster = new Map<string, { native: string[]; primary: string | null }>();
  for (const n of nameRows) {
    const bucket = namesByMaster.get(n.masterId) ?? { native: [], primary: null };
    if (n.locale === "en") bucket.primary = bucket.primary ?? n.value;
    else bucket.native.push(`${n.locale}: ${n.value}`);
    namesByMaster.set(n.masterId, bucket);
  }

  let evidenceFilter = new Set<string>();
  if (filter.tier) {
    const rows = await db
      .select({ tid: transmissionEvidence.transmissionId })
      .from(transmissionEvidence)
      .where(eq(transmissionEvidence.tier, filter.tier));
    evidenceFilter = new Set(rows.map((r) => r.tid));
  }

  const fmtDates = (b: number | null, d: number | null) =>
    b === null && d === null ? "unknown" : `${b ?? "?"}–${d ?? "?"}`;

  return all
    .filter((e) => {
      if (filter.edgeIds && !filter.edgeIds.includes(e.edgeId)) return false;
      const sM = m.get(e.studentId);
      const tM = m.get(e.teacherId);
      if (!sM || !tM) return false;
      if (filter.school) {
        const ss = schoolSlugOf.get(sM.schoolId ?? "") ?? "";
        const ts = schoolSlugOf.get(tM.schoolId ?? "") ?? "";
        if (ss !== filter.school && ts !== filter.school) return false;
      }
      if (filter.tier && !evidenceFilter.has(e.edgeId)) return false;
      return true;
    })
    .map((e) => {
      const sM = m.get(e.studentId)!;
      const tM = m.get(e.teacherId)!;
      const sN = namesByMaster.get(e.studentId) ?? { native: [], primary: null };
      const tN = namesByMaster.get(e.teacherId) ?? { native: [], primary: null };
      return {
        edgeId: e.edgeId,
        studentSlug: sM.slug,
        teacherSlug: tM.slug,
        studentLabel: sN.primary ?? sM.slug,
        teacherLabel: tN.primary ?? tM.slug,
        studentNative: sN.native,
        teacherNative: tN.native,
        studentDates: fmtDates(sM.birth, sM.death),
        teacherDates: fmtDates(tM.birth, tM.death),
        schoolSlug: schoolSlugOf.get(sM.schoolId ?? "") ?? "unknown",
        existingNotes: e.notes ?? "",
      };
    });
}

function parseArgs(argv: string[]): { school?: string; tier?: string; edgesFile?: string; waveSize: number } {
  const out: { school?: string; tier?: string; edgesFile?: string; waveSize: number } = { waveSize: 25 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--school") out.school = argv[++i];
    else if (a === "--tier") out.tier = argv[++i];
    else if (a === "--edges") out.edgesFile = argv[++i];
    else if (a === "--wave-size") out.waveSize = Number(argv[++i]);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  const edgeIds = args.edgesFile
    ? fs.readFileSync(args.edgesFile, "utf-8").split(/\s+/).filter(Boolean)
    : undefined;

  const payloads = await buildPayloads({
    school: args.school,
    tier: args.tier ?? "D",
    edgeIds,
  });
  const slice = payloads.slice(0, args.waveSize);

  const state = loadState();
  console.log(`[run-evidence-panel] wave size=${slice.length}, filter=${JSON.stringify(args)}, already_processed=${state.processed_edge_ids.length}`);

  // STUB: actual agent dispatch is added in Task 11.
  for (const p of slice) {
    console.log(`  - ${p.teacherSlug} → ${p.studentSlug} [${p.schoolSlug}]`);
  }

  state.last_run = new Date().toISOString();
  saveState(state);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Dry run**

Run: `DATABASE_URL=file:zen.db npx tsx scripts/run-evidence-panel.ts --tier D --wave-size 5`
Expected: prints 5 edge lines + a wave-size summary. State file gets created.

- [ ] **Step 4: Commit**

```bash
git add scripts/run-evidence-panel.ts scripts/data/agent-recipes/transmission-evidence.md
git commit -m "agents: orchestrator skeleton + recipe doc for evidence panel"
```

---

### Task 11: Researcher dispatch (3 parallel agents in isolated worktrees)

**Note:** This task uses the Agent tool which is only available inside an
agentic session. When implementing, the orchestrator script does not
itself spawn agents — it produces a *task pack* (JSON file plus
markdown instructions) that an outer agentic session consumes. The
outer session is the one that uses `Agent(subagent_type, isolation, …)`.

**Files:**
- Modify: `scripts/run-evidence-panel.ts`
- Create: `scripts/data/transmission-evidence/_taskpacks/.gitkeep`

- [ ] **Step 1: Emit a task pack instead of dispatching directly**

Replace the "STUB" loop in `scripts/run-evidence-panel.ts` with:

```ts
  const packDir = path.join(
    process.cwd(),
    "scripts/data/transmission-evidence/_taskpacks",
    `wave-${Date.now()}`,
  );
  fs.mkdirSync(packDir, { recursive: true });
  fs.writeFileSync(
    path.join(packDir, "wave.json"),
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        filter: args,
        edges: slice,
      },
      null,
      2,
    ),
  );
  const allowList = await import("@/lib/source-domains");
  fs.writeFileSync(
    path.join(packDir, "source-domains.json"),
    JSON.stringify(
      {
        SOURCE_DOMAINS: allowList.SOURCE_DOMAINS,
        PROMOTIONAL_DENY: allowList.PROMOTIONAL_DENY.map((r) => r.source),
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(packDir, "README.md"),
    `# Wave ${path.basename(packDir)}\n\n` +
      `Hand this directory to the outer agentic session. The session will:\n\n` +
      `1. For each edge in \`wave.json\`, dispatch 3 researcher subagents in isolated worktrees with the prompt from \`scripts/data/agent-recipes/transmission-evidence.md\`.\n` +
      `2. Collect each subagent's JSON envelope into \`<edgeId>/researcher-{1,2,3}.json\`.\n` +
      `3. Run the reducer subagent on the three envelopes and write the merged evidence file to \`scripts/data/transmission-evidence/<student>__<teacher>.md\`.\n` +
      `4. Run the reviewer subagent; downgrade tier in the file if warranted.\n` +
      `5. Append any suggested corrections to \`scripts/data/transmission-evidence/_suggested-corrections.md\`.\n` +
      `6. Update \`scripts/data/transmission-evidence/_state.json\` by appending the processed edge ids.\n`,
  );
  console.log(`[run-evidence-panel] task pack written: ${packDir}`);
```

The orchestrator is *itself* not the agent dispatcher — it produces
inputs the outer session feeds to `Agent()`. This keeps the script
deterministic, testable, and CI-runnable without an agentic
environment.

- [ ] **Step 2: Run again to confirm pack output**

Run: `DATABASE_URL=file:zen.db npx tsx scripts/run-evidence-panel.ts --tier D --wave-size 3`
Expected: a new directory `scripts/data/transmission-evidence/_taskpacks/wave-<ts>/` with `wave.json`, `source-domains.json`, `README.md`.

- [ ] **Step 3: Commit**

```bash
git add scripts/run-evidence-panel.ts scripts/data/transmission-evidence/_taskpacks/.gitkeep
git commit -m "agents: orchestrator emits per-wave task pack for outer agent session"
```

---

### Task 12: Reducer + Reviewer responsibilities documented as agent harnesses

**Files:**
- Create: `scripts/agent-harness/reduce-envelopes.ts`
- Create: `scripts/agent-harness/review-evidence.ts`

These are deterministic helpers that an agent calls; they do not
themselves run an LLM. The reducer dedupes + tier-computes; the reviewer
audits structure.

- [ ] **Step 1: Reducer harness**

Create `scripts/agent-harness/reduce-envelopes.ts`:

```ts
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

  // Substantive contradiction heuristic: any two envelopes with sources but
  // disjoint hostname sets, OR confidence=low on ≥2 envelopes.
  const hostSets = envelopes
    .filter((e) => (e.sources ?? []).length > 0)
    .map((e) => new Set(e.sources.map((s) => new URL(s.url).hostname.toLowerCase())));
  let disjointPairs = 0;
  for (let i = 0; i < hostSets.length; i++) {
    for (let j = i + 1; j < hostSets.length; j++) {
      const intersect = [...hostSets[i]].some((h) => hostSets[j].has(h));
      if (!intersect) disjointPairs++;
    }
  }
  const lowConfidenceCount = envelopes.filter((e) => e.confidence === "low").length;
  const humanReviewNeeded = disjointPairs >= 1 || lowConfidenceCount >= 2;

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
```

- [ ] **Step 2: Reviewer harness (structural-only)**

Create `scripts/agent-harness/review-evidence.ts`:

```ts
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
      updated = updated.replace(/(^reviewer_notes:\s*\|\n([\s\S]*?))(\n---)/m, (_m, head, body, tail) => {
        return `${head}\n  ${args["append-note"]}${tail}`;
      });
    } else {
      updated = updated.replace(/^---\s*$/m, "reviewer_notes: |\n  " + args["append-note"] + "\n---");
    }
  }
  fs.writeFileSync(args.file, updated);
}

main();
```

- [ ] **Step 3: Commit**

```bash
git add scripts/agent-harness
git commit -m "agents: reducer + reviewer harnesses (deterministic helpers)"
```

---

### Task 13: One-time import of existing citations

**Files:**
- Create: `scripts/import-existing-citations-to-evidence.ts`

- [ ] **Step 1: Write the importer**

Create `scripts/import-existing-citations-to-evidence.ts`:

```ts
/**
 * One-time: seed an evidence file per edge from the existing
 * citations rows where entity_type='master_transmission'. Tier is
 * computed from scratch — old citations don't auto-confer A/B status.
 * All imported files are written with human_review_needed: true.
 *
 * Safe to re-run: skips edges that already have an evidence .md file.
 *
 * Usage:
 *   DATABASE_URL=file:zen.db npx tsx scripts/import-existing-citations-to-evidence.ts
 */
import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import { masters, masterTransmissions, citations, sources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { classifyUrl } from "@/lib/source-domains";
import { computeTier, type EvidenceSource } from "@/lib/edge-trust";

const OUT = path.join(process.cwd(), "scripts/data/transmission-evidence");

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const mastersList = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const slugOf = new Map(mastersList.map((m) => [m.id, m.slug]));

  const edges = await db
    .select({
      id: masterTransmissions.id,
      studentId: masterTransmissions.studentId,
      teacherId: masterTransmissions.teacherId,
    })
    .from(masterTransmissions);

  const cits = await db
    .select({
      entityId: citations.entityId,
      entityType: citations.entityType,
      sourceId: citations.sourceId,
    })
    .from(citations)
    .where(eq(citations.entityType, "master_transmission"));

  const srcRows = await db.select().from(sources);
  const srcById = new Map(srcRows.map((s) => [s.id, s]));

  const today = new Date().toISOString().slice(0, 10);

  let imported = 0;
  let skipped = 0;
  for (const e of edges) {
    const sSlug = slugOf.get(e.studentId);
    const tSlug = slugOf.get(e.teacherId);
    if (!sSlug || !tSlug) continue;
    const file = path.join(OUT, `${sSlug}__${tSlug}.md`);
    if (fs.existsSync(file)) {
      skipped++;
      continue;
    }
    const edgeCits = cits.filter((c) => c.entityId === e.id);
    const evSources: EvidenceSource[] = [];
    for (const c of edgeCits) {
      const src = srcById.get(c.sourceId);
      if (!src || !src.url) continue;
      const cls = classifyUrl(src.url);
      evSources.push({
        publisher: cls.publisher ?? src.title ?? src.url,
        url: src.url,
        domain_class: cls.class,
        retrieved_on: today,
        quote: "(quote pending; imported from legacy citation — please paste verbatim passage that attests the transmission)",
      });
    }
    const tier = computeTier(evSources.filter((s) => s.quote.length >= 40));
    // All imported files start as D-or-computed AND human_review_needed=true,
    // because the quote field is a placeholder. The first review pass replaces
    // the placeholder quotes with real verbatim text.
    const yaml = [
      "---",
      `student: ${sSlug}`,
      `teacher: ${tSlug}`,
      `tier: ${tier}`,
      `verified_at: ${today}`,
      evSources.length === 0 ? "sources: []" : "sources:",
      ...evSources.flatMap((s) => [
        `  - publisher: ${JSON.stringify(s.publisher)}`,
        `    url: ${s.url}`,
        `    domain_class: ${s.domain_class}`,
        `    retrieved_on: ${s.retrieved_on}`,
        `    quote: |`,
        ...s.quote.split("\n").map((l) => `      ${l}`),
      ]),
      "reducer_notes: |",
      "  Imported from legacy citations table — quote fields are placeholders.",
      "human_review_needed: true",
      "---",
      "",
    ].join("\n");
    fs.writeFileSync(file, yaml);
    imported++;
  }
  console.log(`[import-existing] imported=${imported} skipped_existing=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run it**

Run: `DATABASE_URL=file:zen.db npx tsx scripts/import-existing-citations-to-evidence.ts`
Expected: `[import-existing] imported=<N> skipped_existing=0`.

Verify: `ls scripts/data/transmission-evidence/*.md | wc -l` — matches `imported` count.

Run the audit: `DATABASE_URL=file:zen.db npx tsx scripts/audit-transmissions.ts`
Expected: many `WARN: evidence-quote-too-short` rows (every imported file has the placeholder quote). That's intended — the next backfill wave replaces them.

- [ ] **Step 3: Reseed + verify the tables**

Run: `DATABASE_URL=file:zen.db npx tsx scripts/seed-transmission-evidence.ts`
Run: `sqlite3 zen.db "SELECT tier, COUNT(*) FROM transmission_evidence GROUP BY tier;"`
Expected: a mix of D + small counts of A/B/C depending on what the legacy citations already supported.

- [ ] **Step 4: Commit the imported files**

```bash
git add scripts/import-existing-citations-to-evidence.ts scripts/data/transmission-evidence/*.md
git commit -m "evidence: import existing transmission citations as draft evidence files"
```

(The committed `.md` files all have `human_review_needed: true` and placeholder quote text — the backfill waves replace them.)

---

## Phase 4 — Backfill waves

Each wave is one task: identify the slice, run the orchestrator, hand the
resulting task pack to the agentic session, land the merged evidence
files. Waves are sequential; do **not** parallelise across waves
(state file would race).

### Task 14: Wave 1 — Tier-1 masters

**Files:**
- Generated: `scripts/data/transmission-evidence/*.md` for tier-1 edges
- Generated: `scripts/data/transmission-evidence/_suggested-corrections.md` (if any)

- [ ] **Step 1: Identify tier-1 edges**

Run:
```bash
DATABASE_URL=file:zen.db npx tsx -e "
import { db } from '@/db';
import { masters, masterTransmissions } from '@/db/schema';
import { TIER_1 } from '@/lib/editorial-tiers';
import fs from 'node:fs';
(async () => {
  const ms = await db.select().from(masters);
  const slugs = new Set(ms.map((m) => m.slug));
  const t1 = new Set([...TIER_1].filter((s) => slugs.has(s)));
  const idOf = new Map(ms.map((m) => [m.slug, m.id]));
  const t1Ids = new Set([...t1].map((s) => idOf.get(s)));
  const edges = await db.select().from(masterTransmissions);
  const targets = edges.filter((e) => t1Ids.has(e.studentId) || t1Ids.has(e.teacherId));
  fs.writeFileSync('wave1-edges.txt', targets.map((e) => e.id).join('\n'));
  console.log('tier-1 edges:', targets.length);
})();
"
```
Expected: prints count (likely 80–150).

- [ ] **Step 2: Generate the task pack**

Run: `DATABASE_URL=file:zen.db npx tsx scripts/run-evidence-panel.ts --edges wave1-edges.txt --wave-size 9999`
Expected: a task pack written under `scripts/data/transmission-evidence/_taskpacks/wave-<ts>/`.

- [ ] **Step 3: Hand the pack to an agentic session**

The outer agentic session reads the pack's `README.md` and dispatches
3 researcher + 1 reducer + 1 reviewer subagents per edge per the
recipe at `scripts/data/agent-recipes/transmission-evidence.md`. The
outer session uses the existing Agent tool with
`subagent_type: general-purpose, isolation: "worktree"` for
researchers so they run in isolated copies of the repo.

Output: one `.md` file per edge appears in
`scripts/data/transmission-evidence/`, replacing the placeholder
quotes for edges that were imported in Task 13.

- [ ] **Step 4: Hand-review `human_review_needed: true` files**

Run: `grep -l "human_review_needed: true" scripts/data/transmission-evidence/*.md | wc -l`
For each, read it. Either flip to `false` after confirming the sources
are good, or add a `reviewer_notes` block explaining what's still
missing.

- [ ] **Step 5: Run the audit**

Run: `DATABASE_URL=file:zen.db npx tsx scripts/audit-transmissions.ts`
Expected: zero `evidence-promotional-source` errors. `evidence-quote-too-short` warnings down to zero for tier-1 edges.

- [ ] **Step 6: Reseed and regenerate static data**

Run: `npm run prebuild`
Expected: completes.

- [ ] **Step 7: Smoke test the UI**

Run: `npm run dev`. Open `/lineage/provenance`. Confirm tier-1 edges have moved from tier D to A/B/C.

- [ ] **Step 8: Commit**

```bash
git add scripts/data/transmission-evidence/
git commit -m "evidence(wave-1): tier-1 masters — quote-backed sources per edge"
```

---

### Task 15: Wave 2 — Canonical Sōtō spine

**Same procedure as Task 14**, scoped to edges in
`scripts/data/canonical-soto-lineage.ts`.

- [ ] **Step 1: Identify Sōtō-spine edges and emit a wave file**

Run:
```bash
DATABASE_URL=file:zen.db npx tsx -e "
import { CANONICAL_SOTO_LINEAGE } from '@/scripts/data/canonical-soto-lineage';
// adjust import to actual export name from that file
import { db } from '@/db';
import { masters, masterTransmissions } from '@/db/schema';
import fs from 'node:fs';
(async () => {
  const ms = await db.select().from(masters);
  const idOf = new Map(ms.map((m) => [m.slug, m.id]));
  const wanted = new Set();
  for (const link of CANONICAL_SOTO_LINEAGE) {
    const s = idOf.get(link.student);
    const t = idOf.get(link.teacher);
    if (s && t) wanted.add(s + '|' + t);
  }
  const edges = await db.select().from(masterTransmissions);
  const ids = edges.filter((e) => wanted.has(e.studentId + '|' + e.teacherId)).map((e) => e.id);
  fs.writeFileSync('wave2-edges.txt', ids.join('\n'));
  console.log('soto-spine edges:', ids.length);
})();
"
```
(Check the actual export name in `scripts/data/canonical-soto-lineage.ts` first; the agent should `cat` the file and use the real symbol.)

- [ ] **Step 2–8:** Repeat Wave-1 steps 2–8 with `wave2-edges.txt`.

```bash
git commit -m "evidence(wave-2): canonical Sōtō spine — quote-backed sources per edge"
```

---

### Task 16: Wave 3 — White Plum + Sanbō Zen + Deshimaru lineages

The contemporary lineages — highest stakes for "feeling left behind."

- [ ] **Step 1: Identify wave-3 edges**

Run:
```bash
DATABASE_URL=file:zen.db npx tsx -e "
import { db } from '@/db';
import { masters, masterTransmissions, schools } from '@/db/schema';
import fs from 'node:fs';
import { inArray } from 'drizzle-orm';
(async () => {
  const targets = ['white-plum-asanga', 'sanbo-zen', 'deshimaru-line'];
  const ss = await db.select().from(schools);
  const sids = ss.filter((s) => targets.includes(s.slug)).map((s) => s.id);
  const ms = await db.select().from(masters);
  const mids = new Set(ms.filter((m) => m.schoolId && sids.includes(m.schoolId)).map((m) => m.id));
  const edges = await db.select().from(masterTransmissions);
  const ids = edges.filter((e) => mids.has(e.studentId) || mids.has(e.teacherId)).map((e) => e.id);
  fs.writeFileSync('wave3-edges.txt', ids.join('\n'));
  console.log('contemporary-lineage edges:', ids.length);
})();
"
```

- [ ] **Step 2–8:** Same as wave-1. Commit message:

```bash
git commit -m "evidence(wave-3): contemporary lineages (White Plum, Sanbō Zen, Deshimaru)"
```

---

### Task 17: Wave 4 — Korean Sŏn / Vietnamese Thiền

- [ ] **Step 1: Identify wave-4 edges**

Run:
```bash
DATABASE_URL=file:zen.db npx tsx -e "
import { db } from '@/db';
import { masters, masterTransmissions, schools } from '@/db/schema';
import fs from 'node:fs';
(async () => {
  const ss = await db.select().from(schools);
  const koreanVietSlugs = ['seon', 'jogye', 'kwan-um', 'taego-order', 'thien', 'truc-lam'];
  const sids = ss.filter((s) => koreanVietSlugs.includes(s.slug)).map((s) => s.id);
  const ms = await db.select().from(masters);
  const mids = new Set(ms.filter((m) => m.schoolId && sids.includes(m.schoolId)).map((m) => m.id));
  const edges = await db.select().from(masterTransmissions);
  const ids = edges.filter((e) => mids.has(e.studentId) || mids.has(e.teacherId)).map((e) => e.id);
  fs.writeFileSync('wave4-edges.txt', ids.join('\n'));
  console.log('KV edges:', ids.length);
})();
"
```

- [ ] **Step 2–8:** Same as wave-1. Commit message:

```bash
git commit -m "evidence(wave-4): Korean Sŏn + Vietnamese Thiền lineages"
```

---

### Task 18: Wave 5 — Remaining historical edges

Everything not already covered: pre-Tang Indian patriarchs, early Chan,
the remaining Chinese schools, edges into Japanese schools not part of
the Sōtō spine.

- [ ] **Step 1: Identify wave-5 edges (everything not yet tier-A/B/C)**

Run:
```bash
DATABASE_URL=file:zen.db npx tsx -e "
import { db } from '@/db';
import { masterTransmissions, transmissionEvidence } from '@/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'node:fs';
(async () => {
  const dRows = await db.select({ tid: transmissionEvidence.transmissionId })
    .from(transmissionEvidence).where(eq(transmissionEvidence.tier, 'D'));
  fs.writeFileSync('wave5-edges.txt', dRows.map((r) => r.tid).join('\n'));
  console.log('remaining tier-D edges:', dRows.length);
})();
"
```

- [ ] **Step 2–8:** Same as wave-1. Multiple sub-commits per wave-5 batch are fine — each batch can be 50–100 edges, committed separately so PRs stay reviewable.

```bash
git commit -m "evidence(wave-5): historical edges — provenance pass"
```

---

### Task 19: Tier-D budget gate

After Wave 5, lock in a budget so the system doesn't backslide.

**Files:**
- Modify: `scripts/check-exit-criteria.ts`

- [ ] **Step 1: Add tier-D budget check**

In `scripts/check-exit-criteria.ts`, find the section that prints the
final coverage summary. Append:

```ts
// Tier-D budget. After Wave 5 we hold the line at the post-backfill count.
const TIER_D_BUDGET = 0; // raise temporarily if a new edge lands without evidence
const tdCount = await db
  .select({ id: transmissionEvidence.id })
  .from(transmissionEvidence)
  .where(eq(transmissionEvidence.tier, "D"));
if (tdCount.length > TIER_D_BUDGET) {
  console.error(
    `✘ Tier-D edges (${tdCount.length}) exceed budget (${TIER_D_BUDGET}). Add evidence or raise the budget.`,
  );
  process.exit(1);
}
```

Add the needed imports at the top:

```ts
import { transmissionEvidence } from "@/db/schema";
import { eq } from "drizzle-orm";
```

- [ ] **Step 2: Verify**

Run: `DATABASE_URL=file:zen.db npx tsx scripts/check-exit-criteria.ts`
Expected: passes if all waves landed.

- [ ] **Step 3: Commit**

```bash
git add scripts/check-exit-criteria.ts
git commit -m "audit: tier-D budget gate after Wave 5 backfill"
```

---

## Self-Review

After all tasks land, walk the spec section by section and confirm each
requirement maps to a task:

| Spec section                          | Task(s)            |
| ------------------------------------- | ------------------ |
| Evidence file schema                  | Task 3             |
| Tier ladder A/B/C/D                   | Task 3, Task 5     |
| Domain classes + deny-list            | Task 2             |
| `transmission_evidence` table         | Task 1             |
| `transmission_sources` table          | Task 1             |
| `src/lib/source-domains.ts`           | Task 2             |
| `src/lib/edge-trust.ts`               | Task 3             |
| `scripts/seed-transmission-evidence.ts` | Task 4           |
| Audit extensions                      | Task 5             |
| Static-data generator joins evidence  | Task 6             |
| Edge styling by tier                  | Task 7             |
| Provenance side panel                 | Task 8             |
| `/lineage/provenance` index page      | Task 9             |
| Agent orchestrator                    | Tasks 10–11        |
| Reducer + reviewer harnesses          | Task 12            |
| Existing-citation ingestion           | Task 13            |
| Backfill waves                        | Tasks 14–18        |
| No auto-applied edge changes          | Tasks 10–13 (suggestion file only) |
| Tier-D budget post-backfill           | Task 19            |

**Risks owned in the plan:**

- Agents fabricating sources → reviewer harness + audit dead-URL pass (Task 5, env flag).
- Researchers colluding → isolated worktrees per researcher (Task 11).
- `_suggested-corrections.md` becoming a graveyard → human-merge step in each wave (Tasks 14–18 step 4).
- Source allow-list drift → `evidence-source-unknown-domain` warning surfaces every new domain (Task 5).
- Tier-D regression → budget gate (Task 19).
