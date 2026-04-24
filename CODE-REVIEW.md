# Zen Lineage — Comprehensive Code Review

**Date:** March 20, 2026
**Scope:** Full repository audit — code quality, architecture, dependencies, TypeScript, testing, performance, security, documentation, build/deploy, data integrity
**Files reviewed:** 31 source files, 33 scripts, 23 test files, all configs

---

## Overall Assessment: B+

A well-architected project with strong data modeling, excellent documentation, and thorough test coverage for the data pipeline. The main areas for improvement are: database query efficiency in page components, PixiJS graph performance, transaction safety in the seed pipeline, and missing CI/CD.

| Area | Grade | Summary |
|------|-------|---------|
| Code Quality | B | Solid but has repeated patterns and unextracted helpers |
| Architecture | A- | Clean pipeline, good separation; query layer needs optimization |
| Dependencies | A | All current, no unused or vulnerable packages |
| TypeScript | B+ | Strict mode, but some `any` casts and missing null checks |
| Testing | B+ | 23 test files with golden-file patterns; no UI or integration tests |
| Performance | B- | PixiJS graph has unthrottled redraws; pages run 10-15 DB queries each |
| Security | A | Drizzle ORM prevents injection; secrets properly gitignored |
| Documentation | A | Excellent README + TODO with phase tracking and exit criteria |
| Build/Deploy | B | Static export works well; no CI/CD pipeline yet |
| Data Integrity | B | Strong provenance model; seed-db.ts lacks transaction safety |

---

## 1. Code Quality

### Repeated name resolution pattern (MEDIUM)

The "prefer dharma name, fallback to any name" logic is duplicated 7+ times across:

- `src/app/masters/[slug]/page.tsx` (lines 71-75, 145-154, 215-224)
- `src/app/schools/[slug]/page.tsx` (lines 91-101)
- `src/app/masters/page.tsx` (lines 33-43)
- `src/app/proverbs/page.tsx` (lines 103-112)
- `src/app/timeline/page.tsx` (lines 70-80)

Each uses two sequential loops — one for dharma names, one for fallback. **Extract to `src/lib/name-resolution.ts`** with a single-pass implementation.

### Citation set building duplicated (LOW)

`buildCitationKeySet()` exists in `publishable-content.ts` but isn't used everywhere. Pages in `page.tsx`, `masters/[slug]/page.tsx`, and `proverbs/page.tsx` rebuild citation sets manually.

### Magic numbers in LineageGraph.tsx (LOW)

`LAYER_H = 110`, `NODE_W = 150`, fallback layout `[120, 70]` — should live in a `graph-constants.ts` file.

### Two-loop map building anti-pattern (LOW)

In `masters/page.tsx` lines 33-43 and `proverbs/page.tsx` lines 103-112, name maps are built with two full iterations over the data. A single pass with priority logic is cleaner and faster.

---

## 2. Architecture

### Database query proliferation (HIGH)

Detail pages run far too many sequential queries:

- **`masters/[slug]/page.tsx`**: ~12 separate DB queries (biography, names, teachers, students, citations, roles, role names, media, media citations)
- **`schools/[slug]/page.tsx`**: ~8 queries with separate citation lookups per image
- **`page.tsx` (home)**: 3 sequential queries just to resolve a teaching author name

Since this is a static export (queries run at build time only), the impact is build speed rather than user-facing latency. But it still adds up across 400+ master pages. **Batch with JOINs** — Drizzle supports `.leftJoin()` — to reduce to 3-4 queries per page.

### Client-side graph is well-structured

`LineageGraph.tsx` (908 lines) is large but logically organized: init → layout → render → interaction → search. The `useRef` + `useEffect` pattern for PixiJS is appropriate. The main concern is size — consider splitting into `useGraphInit`, `useGraphSearch`, `useGraphInteraction` custom hooks.

### Data pipeline is excellent

The raw → reconciled → canonical → seeded pipeline is well-designed with clear stage boundaries. The `reconcile.ts` deduplication/merge logic and `dag-validation.ts` integrity checks are standout features.

---

## 3. Dependencies

`package.json` is clean:

- **All dependencies current** — Next.js 16, Drizzle 0.40, Tailwind v4, PixiJS v8
- **No unused packages detected**
- **No known vulnerabilities** in the dependency tree
- **Dev/prod split correct** — build tools in devDependencies

The only note: `@opennextjs/cloudflare` and `wrangler` suggest an SSR deployment path that's not currently active (static export mode). These could be removed if SSR is permanently off the table, but they're harmless.

---

## 4. TypeScript

### Strengths
- `"strict": true` in tsconfig.json
- Proper path aliases (`@/*` → `./src/*`)
- `env.d.ts` types Cloudflare bindings
- Schema types generated from Drizzle

### Issues

**`any` casts in seed-images.ts** (MEDIUM): `(await res.json()) as any` at multiple points. The Wikimedia API responses should have typed interfaces.

**Unsafe type assertion in LineageGraph.tsx** (MEDIUM): `node.data as string` (line 364-365) — no runtime validation. If d3-dag API changes, this fails silently.

**ID generation in seed-db.ts** (MEDIUM): `name.value.slice(0, 20)` without UTF-8 awareness could split multi-byte CJK characters, and truncation could produce non-unique IDs.

**`smartFetch()` return type** in seed-images.ts: Returns `Record<string, unknown> | Response` but callers always treat it as `Response`.

**Scripts excluded from tsconfig** — `tsconfig.json` doesn't include `scripts/`, so type errors in the pipeline aren't caught by `tsc`.

---

## 5. Testing

### Strengths (23 test files)
- **Golden file pattern** for all extractors (PDF, Wikipedia, Terebess, Tibetan Encyclopedia, Wikisource, Mountain Moon)
- **Comprehensive reconciliation tests** (669 lines): merging, deduplication, alias resolution, edge building
- **DAG validation** tests cycles, self-loops, temporal violations, orphans, duplicate edges
- **Editorial tier** and **publishable content** tests enforce quality gates
- **Date parsing** covers BCE, centuries, circa, abbreviated years
- **CJK search tokens** test pinyin/romaji conversion

### Gaps
1. **No UI/component tests** — LineageGraph, MastersClient, ProverbsClient, TimelineClient have zero test coverage
2. **No integration tests** — no end-to-end pipeline test (reconcile → seed → build)
3. **No image processing tests** — `seed-images.ts` and `sharp` usage untested
4. **No migration tests** — schema evolution not validated
5. **Limited negative-case testing** — most tests validate happy paths; few malformed input scenarios

---

## 6. Performance

### LineageGraph.tsx — unthrottled redraws (HIGH)

- **Search highlighting** (lines 750-796): `redraw()` fires on every keystroke with no debounce. For 1000+ nodes, this is O(n) per character typed. **Add 200-300ms debounce.**
- **School filter** (line 703): Rapid clicks trigger multiple full redraws. **Throttle to one redraw per animation frame.**
- **No object pooling**: All 2000+ PixiJS Container/Graphics/Text objects are created upfront. Mobile devices will struggle at 5000+ nodes.

### Build-time query volume (MEDIUM)

With 400+ master pages each running 12+ queries, the build executes ~5,000+ SQLite queries. Not a user-facing issue, but batching with JOINs would significantly speed up builds.

### shuffle() on every render (LOW)

`proverbs/page.tsx` line 228: `shuffle(items)` creates a new array each render. Since this is a static page, it only runs at build time, so impact is negligible.

---

## 7. Security

### No issues found in production code

- Drizzle ORM parameterizes all queries — no SQL injection risk
- React's JSX escaping prevents XSS
- `.env*` properly gitignored
- No hardcoded API keys or secrets in configs
- `graph.json` is a public static file (appropriate for a public encyclopedia)

### Minor script-level notes

- `extract-wikisource.ts` line 25: User-Agent contains `zen-project@example.com` — harmless placeholder but should be updated if this is a real contact
- `seed-images.ts`: No file size validation on image downloads — could exhaust memory on unusually large files (dev script only, not production)

---

## 8. Documentation

### Excellent

- **README.md**: Clear description, stats, tech stack, setup instructions, data pipeline diagram, source enumeration, quality rules, contributing guidelines, license
- **TODO.md**: 10 phases with exit criteria, baseline metrics, publication contract, milestone tracking — unusually thorough for a solo project
- **Inline comments**: Good in migration files and complex parsing logic

### Gaps
- No per-script documentation for the extractors (especially `extract-pdf.ts` which is dense)
- No architecture diagram showing the full data flow visually
- No database schema documentation beyond the Drizzle schema file itself

---

## 9. Build/Deploy

### Current setup works

- `npm run prebuild` → seeds DB + generates static data
- `npm run build` → Next.js static export to `/out`
- Cloudflare Pages deployment via `wrangler.toml`
- OpenNext adapter configured (for potential SSR migration)

### Issues

**No CI/CD pipeline** (HIGH): No GitHub Actions, no automated test runs. TODO.md Phase 10 acknowledges this. A basic pipeline (lint → test → build) would catch regressions.

**Build fails if seed fails**: `prebuild` runs `seed-db.ts` which has no transaction safety. If it fails partway, the database is left inconsistent and the build proceeds with partial data.

**Scripts not type-checked in build**: `tsconfig.json` excludes `scripts/` — a separate `tsconfig.scripts.json` with `tsc --noEmit` would catch type errors in the pipeline.

---

## 10. Data Integrity

### Strengths
- Multi-source reconciliation with reliability scoring
- DAG validation prevents cycles, self-loops, impossible temporal edges
- Publication gates: content requires citations before it's rendered
- Provenance tracking: `ingestion_runs`, `source_snapshots`, `citations` tables
- Editorial overlay via `originals-curated.json` for manual corrections

### Issues

**No transaction safety in seed-db.ts** (HIGH): `resetDerivedTables()` deletes data across multiple tables without a transaction. If it fails midway, the DB is left with orphaned/missing records. The subsequent inserts are also non-transactional — a crash at token #5000 of 10000 leaves partial data.

**Batch insert not actually batching** (MEDIUM): `seed-db.ts` lines 218-241 create 500-item chunks but still execute one INSERT per token. Should use `db.insert(searchTokens).values([...chunk])` for true batching.

**Fragile web scrapers** (MEDIUM): `extract-wikisource.ts` relies on specific Wikisource HTML structure (`div.ws-summary ol li`). A layout change breaks extraction silently — returns 0 items but still marks as "successful."

**Alias validation missing** (MEDIUM): `aliases.json` is loaded without schema validation. Duplicate variant mappings are silently resolved (last one wins), which could produce incorrect canonical master assignments.

---

## Top 10 Recommendations (Priority Order)

1. **Add transaction wrapping to seed-db.ts** — wrap `resetDerivedTables()` and each seed phase in `db.transaction()`
2. **Extract shared name-resolution helper** — eliminate 7+ copies of the dharma-name-priority pattern
3. **Debounce LineageGraph search** — 200-300ms delay on keystroke-triggered redraws
4. **Add CI/CD pipeline** — GitHub Actions: lint → typecheck → test → build
5. **Batch database queries on detail pages** — reduce 12+ queries to 3-4 with JOINs
6. **Fix batch inserts in seed-db.ts** — use multi-value `.values([...chunk])` instead of per-row inserts
7. **Add component tests** — at minimum, smoke tests for the four client components
8. **Add `tsconfig.scripts.json`** — type-check the pipeline scripts separately
9. **Add React Error Boundary** — wrap LineageGraph to prevent full-page crashes
10. **Validate external JSON inputs** — schema-check `aliases.json` and raw data files before use
