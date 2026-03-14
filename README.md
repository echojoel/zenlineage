# Zen Lineage & Encyclopedia

An interactive encyclopedia of Zen Buddhist masters, schools, and dharma transmission lineages. Built with Next.js, Drizzle ORM, and PixiJS.

## What it is

The current workspace snapshot contains 231 masters across 14 schools, from the Indian patriarchal lineage through Early Chan and into Japanese Soto, Rinzai, and Sanbo Zen. The project already supports source-backed master identities, names, dates, schools, citations, biographies, and lineage edges. The latest curation pass also restores the core early Chan bridge transmissions that connect the Indian patriarchal chain into the major East Asian branches. The next ingestion phases expand that foundation into full encyclopedia coverage with structured histories, quotes, and images for each master where trustworthy material exists.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — links to all sections |
| `/lineage` | Interactive DAG explorer (PixiJS + d3-dag). Pan/zoom, hover tooltips, click sidebar, school filter, time scrubber, fuzzy search |
| `/masters` | Searchable grid/list of all masters. Fuse.js search, school filter, grid↔list toggle |
| `/masters/[slug]` | Master detail — names, dates, school, biography, teachers, students, source citations |
| `/schools` | List of all schools with master counts |
| `/schools/[slug]` | School detail — tradition, parent school, all members, sources |
| `/timeline` | Placeholder (Phase 3) |

## Stack

- **Next.js 16** App Router — server components for data fetching, client components for interactivity
- **Drizzle ORM** + **LibSQL/SQLite** (`zen.db`) — all data access
- **PixiJS v8** — WebGL canvas rendering for the lineage graph
- **d3-dag** — Sugiyama hierarchical layout for connected nodes
- **d3-zoom** — pan/zoom on canvas
- **Fuse.js** — fuzzy search on masters list and lineage graph
- **Tailwind CSS v4** + custom CSS variables for the light, minimal aesthetic

## Current workspace snapshot

These numbers describe the local checked-in data and `zen.db` in this workspace. Update them whenever the ingestion baseline materially changes.

| Metric | Current |
|-------|---------|
| Source rows in `sources` | 9 |
| Active cited sources | 8 |
| Raw input datasets in `scripts/data/raw/` | 7 |
| Recorded ingestion runs | 8 |
| Recorded source snapshots | 7 |
| Canonical masters | 231 |
| Schools | 14 |
| Transmission edges | 70 |
| Masters with at least one citation | 231 |
| Masters with biographies in `master_biographies` | 50 |
| Biographies with item-level citations | 50 |
| Media assets with item-level citations | 0 |
| Masters with image metadata | 5 hardcoded fallbacks, 33 uncited rows in `media_assets`, 0 published |
| Orphan masters with no lineage edges | 153 |

## Data pipeline

```
Registered sources
  → extractors and provenance sync write scripts/data/raw/*.json plus `ingestion_runs` / `source_snapshots`
  → scripts/reconcile.ts builds canonical masters, transmissions, citations, search tokens, review queue
  → scripts/data/reconciled/*.json
  → seed scripts upsert into zen.db
  → app routes and graph API read from zen.db
```

Current source registry:

- `src_chan_ancestors_pdf`
- `src_tibetan_encyclopedia`
- `src_terebess`
- `src_cosmos_chan` (registered, not populated yet)
- `src_mountain_moon`
- `src_wikipedia`
- `src_originals_curated`
- `src_sotozen_founders`
- `src_editorial_biographies`

Current raw inputs also include curated datasets such as `originals-curated.json` and `soto-curated.json`. These must be handled explicitly: true editorial overlays get their own provenance, while curated extracts may still point to a single upstream source when that mapping is clear.

Re-seed: `npx tsx scripts/seed-db.ts`
One-shot validation path: `npm run pipeline`

## Database schema (key tables)

| Table | Purpose |
|-------|---------|
| `masters` | Core records — slug, dates with precision/confidence, schoolId |
| `master_names` | All name variants — locale (en/zh), nameType (dharma/alias/honorific/birth) |
| `master_biographies` | Sourced historical narratives per master and locale |
| `master_transmissions` | Teacher → student edges — type (primary/secondary/disputed), isPrimary |
| `teachings` + `teaching_content` | Quotes, koan excerpts, teachings, and source text content |
| `schools` + `school_names` | School hierarchy with parentId for Caodong→Soto etc. |
| `citations` | Source attribution per field per entity |
| `sources` | Source metadata — title, reliability, url |
| `assertions` + `review_status` | Disputed facts and editorial review state |
| `media_assets` | Images and other media with attribution, license, and alt text |

## Structured Population Strategy

The project should grow by tightening provenance and entity quality first, then layering in new source classes in a controlled order.

### Canonical storage decisions

- `masters` and `master_names` remain the canonical identity layer.
- `master_biographies` is the canonical store for master histories.
- `teachings` and `teaching_content` are the canonical store for quotes, koan excerpts, and short primary-source teachings.
- `media_assets` is the canonical store for images. Hardcoded image maps are transitional only.
- `citations` must exist for every published history, quote, image, date, school, or lineage fact.
- `assertions`, `assertion_citations`, and `review_status` should hold disagreements instead of collapsing them into a single unreviewed value.
- Public UI should withhold biographies, teachings, and images until item-level citations exist. Draft presence in the database is not the same thing as published content.
- The current Tier 1 biography seed publishes editorial summaries with item-level citations plus linked supporting master-source evidence. Paragraph-level source tracing remains a stricter follow-up task.

### Source policy

- Add sources in small batches. Do not aggregate large numbers of new feeds until reconciliation quality is stable.
- Keep external sources and internal curated overlays separate. A local editorial dataset must never pretend to be Wikipedia or another upstream source.
- Rank sources by field, not globally. A lineage chart can be strong for teacher relationships and weak for biography or image claims.
- No new source is accepted without a reproducible extractor or curated import format, at least one fixture or golden test, and recorded run metadata.
- Target 12 to 14 active sources total by adding 6 to 8 high-yield sources after cleanup. The goal is better coverage diversity, not maximum source count.

### Coverage targets

- Every master should have a stable canonical identity, at least one citation, and school assignment when supportable.
- Every master should eventually have a short sourced history in `master_biographies`.
- Quotes are desirable but optional. Only import quotes that can be tied to a work, translator or edition, and a precise locator.
- Images are opportunistic, not mandatory. Only import images with clear attribution, license, source URL, and alt text.
- Roll out in tiers:
  - Tier 1: patriarchs, founders, and the most visible masters receive full profiles first.
  - Tier 2: the next 100 masters receive concise histories plus quotes or images when supportable.
  - Tier 3: the long tail remains as sourced stubs until higher-quality material is found.

## Ordered Process

1. Audit the current baseline.
   - Measure source counts, citation depth, biography coverage, image coverage, orphan counts, and obvious bad records before adding anything new.
2. Harden provenance.
   - Make every dataset use a correct `source_id`, separate curated overlays from external sources, and record ingestion runs and snapshots.
3. Fix reconciliation quality.
   - Resolve bad slugs, alias collisions, mistaken merges, teacher mismatches, and parse artifacts before expanding the source set.
4. Add new sources one or two at a time.
   - Prefer sources that improve weak areas: biographies, dates, canonical names, quotes, and media metadata.
5. Import histories.
   - Write concise, sourced biographies into `master_biographies`, then attach review state for editorial QA.
6. Import quotes and teaching excerpts.
   - Store each item in `teachings` and `teaching_content` with author, collection, locale, and citation metadata.
7. Import images.
   - Move image storage to `media_assets`, requiring attribution, license, alt text, dimensions, and source URL.
8. Review and publish.
   - Validate the graph, re-run seeding, review ambiguous assertions, and only then surface new content in the UI.

## Quality Gates

- No uncited history, quote, image, or lineage change gets published.
- No new source enters the pipeline without a parser or defined import shape, a fixture, and a reproducible run path.
- No ambiguous merge is auto-accepted when it creates suspicious slugs, short tokens, or obviously mismatched aliases.
- No image is published without license, attribution, and source URL.
- No bulk history or quote import is accepted without spot-checking samples against their citations.
- Every ingestion pass should end with `npm run pipeline`, or the equivalent ordered command sequence including provenance sync, reconcile, seed, audit, graph validation, build, and tests.
- Review queue items should be resolved deliberately rather than bypassed.
- Hardcoded image fallbacks and uncited biography drafts may exist locally, but they should not be shown as verified public content.

## Decision log

- Quality takes precedence over source count.
- The immediate priority is to improve reconciliation and provenance before scaling source aggregation.
- The database should distinguish raw external evidence from internal editorial curation.
- When an upstream extractor does not expose a foundational teacher relationship but the lineage fact is high-confidence, add it explicitly through the editorial overlay instead of pretending it came from the extractor.
- Histories are required coverage; quotes and images are best-effort coverage subject to attribution and licensing quality.
- The app should migrate away from hardcoded image mappings toward `media_assets`.
- Encyclopedia expansion should proceed in tiers, not as an all-or-nothing bulk import.

## Development

```bash
npm run dev          # start dev server
npm run pipeline     # backfill provenance, reconcile, seed, audit, build, and test
npm run provenance:backfill # sync raw datasets into ingestion_runs/source_snapshots
npx next build       # production build
npx next lint        # lint check (zero errors, zero warnings)
npx tsx scripts/reconcile.ts        # rebuild reconciled JSON outputs
npx tsx scripts/seed-db.ts          # re-seed database
npx tsx scripts/seed-biographies.ts # seed biographies
npx tsx scripts/check-exit-criteria.ts # audit coverage and source usage
npx tsx scripts/validate-graph.ts   # DAG integrity check
```

## Data quality notes

- **Orphan masters** (153/231): masters with no linked transmission edges — shown hidden by default in the lineage explorer, toggled via "Show orphans"
- **Date precision**: `exact` | `circa` (c.) | `century` (fl. Xc) | `unknown` (?)
- **Date confidence**: `certain` | `probable` | `uncertain` | `legendary`
- **School taxonomy**: defined in `src/lib/school-taxonomy.ts` — covers Indian Patriarchs, Chan → Caodong → Soto, and Chan → Linji → Rinzai hierarchies
- **Current enrichment gap**: biographies and images are only partially populated; this is intentional until provenance, reconciliation, and review gates are fully enforced.
- **Current publishing rule**: uncited biography drafts and hardcoded fallback images are withheld from the master detail page and lineage sidebar until item-level citations or DB-backed media assets exist.
