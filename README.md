# Zen Lineage & Encyclopedia

An interactive encyclopedia of Zen Buddhist masters, schools, and dharma transmission lineages.

## Pages

| Route | What it shows |
|---|---|
| `/` | Home |
| `/lineage` | Interactive DAG (PixiJS + d3-dag) — pan/zoom, school filter, time scrubber, fuzzy search |
| `/masters` | Searchable grid of all masters with school filter |
| `/masters/[slug]` | Master detail — names, dates, school, lineage, biography, teachings, sources |
| `/schools` | All schools with master counts |
| `/schools/[slug]` | School detail — tradition, members, sources |
| `/timeline` | Placeholder |

## Stack

- **Next.js 16** App Router (server components + client interactivity)
- **Drizzle ORM** + **LibSQL/SQLite** (`zen.db`)
- **PixiJS v8** + **d3-dag** + **d3-zoom** for the lineage graph
- **Fuse.js** for fuzzy search
- **Tailwind CSS v4** + custom CSS variables

## Current numbers

| Metric | Count |
|---|---|
| Masters | 296 |
| Schools | 14 |
| Transmission edges | 293 |
| Citations | 1,392 |
| Sources (registered / actively cited) | 15 / 11 |
| Teachings (48 Mumonkan + 5 standalone) | 53 |
| Masters with images | 86 |
| Masters with biographies | 0 (next phase) |
| Orphan masters (no lineage edges) | 0 |

## Data pipeline

```
raw sources (PDF, HTML scrapers, curated JSON)
  → scripts/data/raw/*.json
  → scripts/reconcile.ts  →  scripts/data/reconciled/*.json
  → scripts/seed-db.ts    →  zen.db
  → Next.js reads from zen.db
```

Teachings follow a parallel path:

```
scripts/data/raw-teachings/teachings-*.json
  → scripts/seed-teachings.ts  →  zen.db (teachings + teaching_content + citations)
```

### Sources

| ID | What | URL |
|---|---|---|
| `src_chan_ancestors_pdf` | Andy Ferguson's lineage chart | wisdomexperience.org |
| `src_tibetan_encyclopedia` | Tibetan Buddhist Encyclopedia | tibetanbuddhistencyclopedia.com |
| `src_terebess` | Terebess Asia Online | terebess.hu |
| `src_cosmos_chan` | Cosmos Chan lineage charts | cosmoschan.org |
| `src_mountain_moon` | Mountain Moon Sanbo-Zen chart | mountainmoon.org.au |
| `src_wikipedia` | Wikipedia Zen lineage charts | en.wikipedia.org |
| `src_sotozen_founders` | Soto Zen official founders page | sotozen.com |
| `src_wikisource` | Wikisource free library | en.wikisource.org |
| `src_mumonkan_senzaki_1934` | Mumonkan — Senzaki/Reps 1934 | en.wikisource.org |
| `src_originals_curated` | Editorial overlay (internal) | — |
| `src_editorial_biographies` | Editorial biographies (internal) | — |
| `src_editorial_teachings` | Editorial teachings (internal) | — |
| `src_wikimedia_commons` | Wikimedia Commons images | commons.wikimedia.org |

### Raw data files

Masters (`scripts/data/raw/`): `chan-ancestors.json`, `tibetan-encyclopedia.json`, `terebess.json`, `wikipedia.json`, `mountain-moon.json`, `originals-curated.json`, `soto-curated.json`

Teachings (`scripts/data/raw-teachings/`): `teachings-mumonkan.json` (48 cases), `teachings-standalone.json` (5 verses/dialogues)

## Key tables

| Table | Purpose |
|---|---|
| `masters` | Identity — slug, birth/death year with precision and confidence, school |
| `master_names` | Name variants — locale (en/zh), type (dharma/alias/honorific/birth) |
| `master_transmissions` | Teacher → student edges with type (primary/secondary/disputed) |
| `master_biographies` | Sourced historical narratives per master |
| `teachings` + `teaching_content` | Koans, verses, dialogues with locale, translator, edition |
| `schools` + `school_names` | School hierarchy (e.g. Caodong → Soto) |
| `citations` | Source attribution per field per entity |
| `sources` | Bibliographic metadata — title, author, URL, reliability |
| `media_assets` | Images with attribution, license, alt text |
| `ingestion_runs` + `source_snapshots` | Provenance tracking for each data import |

## Commands

```bash
# Day-to-day
npm run dev               # dev server
npm run seed              # seed everything (sources, masters, schools, transmissions, citations, biographies, teachings)
npm run reconcile         # rebuild reconciled JSON from raw sources
npm run audit             # coverage audit

# Full pipeline (reconcile → seed → audit → build → test)
npm run pipeline

# Individual steps
npx tsx scripts/validate-graph.ts   # DAG integrity check
npx next build                      # production build
npx vitest run                      # run tests
```

`npm run seed` is the single entry point for database seeding. It calls everything in order — you never need to run `seed-biographies.ts` or `seed-teachings.ts` separately.

## Quality rules

- Nothing gets published (biographies, teachings, images) without item-level citations.
- No new source without a reproducible extractor, at least one fixture test, and recorded ingestion metadata.
- External sources and internal editorial overlays stay separate — an editorial dataset never pretends to be an upstream source.
- Dates carry precision (`exact`/`circa`/`century`/`unknown`) and confidence (`certain`/`probable`/`uncertain`/`legendary`).
- Ambiguous merges are flagged for review rather than auto-accepted.

## What's next

- **Biographies**: sourced histories for all masters, starting with Tier 1 (50 most prominent)
- **Blue Cliff Record**: 100 cases, blocked on copyright verification for Shaw 1961 translation
- **Proverbs**: traditional sayings with `attribution_status: "traditional"`
- **More images**: expand from 86 → broader coverage via Wikimedia Commons
