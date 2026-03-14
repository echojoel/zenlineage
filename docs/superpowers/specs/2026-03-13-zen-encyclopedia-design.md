# Zen Encyclopedia — Design Specification

## 1. Product Vision

An interactive encyclopedia of Zen culture targeting **practitioners** as the primary audience. The core experience combines a **lineage explorer** (animated DAG visualization of teacher-student transmission) with an **immersive timeline** (chronological journey through 2,500 years of Zen history).

**Content scope:** Pan-Zen ecosystem — lineages, practices, temples, art, literature, historical events, connections to broader Buddhism, Taoism, modern and Western Zen.

**MVP scope (Phase 1-2):** English-first with original-script names and aliases preserved in the data model. Full multi-language UI and translated content deferred to Phase 3. Initial corpus limited to ~200-500 well-documented masters with traceable sources — breadth over depth at first, enrich iteratively.

## 2. Architecture

**Single Next.js monolith** — one repository containing data pipeline scripts, API routes, lineage visualizer, encyclopedia pages, and i18n. Deploy to Vercel.

**Rationale:** Research-first approach means no reason for premature separation. Data pipeline scripts coexist with the frontend. Extract packages later when complexity warrants it.

## 3. Visual Brand — Ink Wash (Sumi-e)

- **Background:** Warm white (#faf9f7), aged paper tones
- **Lines:** Brush-stroke-style with varying weight and opacity, like ink on paper
- **Nodes:** Ink dots that bloom on hover
- **Typography:** Cormorant Garamond (serif, headings), Inter (sans, body), Noto Serif JP/CJK (Asian scripts)
- **Colors:** Warm greys, aged paper, ink brown (#8b7355), moss green (#5a7a5a), soft ink (#7a6a55)
- **School colors:** Rinzai/Linji (#8b6b4a warm brown), Soto/Caodong (#5a7a5a moss), Sanbo (#7a6a8a muted purple), Early Chan (#7a6a55 deep ink), Indian Patriarchs (#b4a078 gold). Unlisted schools get a default neutral (#9a9080).
- **Feel:** Contemplative, hand-crafted, timeless — minimal and meditative with breathing space

## 4. Data Model

### Graph Formalization

The lineage graph is a **directed acyclic graph (DAG)**, not a tree. A master may have multiple teachers (e.g., Yasutani received transmission from both Soto and Rinzai lines). Edges are directed: teacher → student. Cycles are invalid — a validation rule enforces this at ingestion and on every write.

**DAG properties:**
- Each edge (transmission) has a `type`: primary (main dharma transmission), secondary (additional study/inka), or disputed
- Multiple roots are valid (different Indian patriarchs, independent Chinese masters)
- A master's "generation" is computed from **primary edges only**, within their school branch. Specifically: the length of the primary-edge-only path from the school's root ancestor to the master. If a master has no primary edge (e.g., a school founder received from another school), generation is set relative to the school they founded.

### Core Entities

**Master (Person)**
- `id` — unique slug
- `names` — { dharma, birth, honorific } × { en, ja, zh, ko, vi, sa } + aliases/transliterations
- `dates` — birth, death, ordination — each with precision (exact/circa/century/unknown) and confidence (high/medium/low/disputed)
- `lineage` — school, generation number (computed from DAG shortest-path)
- `teachers` → Master[] (via `master_transmissions`, supports primary + secondary + disputed)
- `students` → Master[] (dharma heirs)
- `temples` → Temple[] (founded, resided)
- `biography` — rich text, per locale
- `teachings` — key teachings, famous koans
- `coordinates` — birth/death/activity locations

**Temple / Monastery**
- `id`, `names` (per locale), `location` (coordinates, region, country)
- `founded` (date with precision/confidence, founder → Master), `school`, `abbots` → Master[]
- `description` (per locale), `status` (active/historical/destroyed)

**Teaching / Text**
- `id`, `title` (per locale), `type` (koan, sutra, commentary, poem, talk)
- `author` → Master, `collection` (e.g., Blue Cliff Record)
- `content` (per locale), `era`, `related` → Teaching[], Master[]

**Lineage / School**
- `id`, `names` (per locale), `tradition` (Chan, Zen, Seon, Thiền)
- `parent` → School, `founder` → Master, `founded` (date with precision/confidence)
- `practices` (free-text in Phase 1; relational in Phase 2+), `description` (per locale), `active` (boolean)

**Event (minimal, Phase 1 schema)**
- `id`, `names` (per locale), `type` (founding, persecution, council, schism, migration, political)
- `date_start`, `date_end` (with precision/confidence)
- `location` — coordinates, region
- `description` (per locale)
- `related_masters` → Master[], `related_temples` → Temple[], `related_schools` → School[]

### Historical Uncertainty Model

All dates use a composite type rather than a bare integer:

```
date_value INT         -- the year (or best estimate)
date_precision TEXT    -- 'exact' | 'circa' | 'decade' | 'century' | 'unknown'
date_confidence TEXT   -- 'high' | 'medium' | 'low' | 'disputed'
```

For disputed facts (transmission claims, founding attributions, biographical details), the `assertions` table records multiple competing claims with sources, rather than storing a single "true" value.

### Provenance Model

Every fact in the encyclopedia must be traceable to a source. This is critical for a research-first encyclopedia with AI-generated content.

**Sources** — Stable bibliographic records (one per work, website, or text — not per scraper run):
- `id`, `type` (scholarly_work, website, lineage_chart, primary_text, oral_tradition, ai_generated)
- `title`, `author`, `url`, `publication_date`
- `reliability` (authoritative, scholarly, secondary, popular, ai_generated)

**Ingestion Runs** — Records each fetch/import against a source:
- `id`, `source_id` FK, `run_date`, `script_name`, `status` (success, partial, failed), `record_count`, `notes`

**Source Snapshots** — Immutable captures of web sources (one per ingestion run):
- `id`, `source_id` FK, `ingestion_run_id` FK, `snapshot_date`, `content_hash`, `archive_url`

**Citations** — Links any fact to its source(s):
- `id`, `source_id` FK, `entity_type` (master, temple, school, teaching, event, transmission)
- `entity_id`, `field_name` (e.g., 'birth_year', 'biography', 'teacher')
- `excerpt` (the specific text/data cited), `page_or_section`

**Assertions** — For disputed facts, multiple competing claims:
- `id`, `entity_type`, `entity_id`, `field_name`
- `value` (the claimed value)
- `status` (accepted, disputed, rejected)

**Assertion Citations** — Join table (an assertion may be backed by multiple sources):
- `assertion_id` FK, `citation_id` FK

### Canonical vs. Assertion Write Path

The `masters`, `master_transmissions`, `schools`, `temples`, and `teachings` tables are **the canonical truth**. Assertions are **supplemental** — they record alternative/disputed claims that differ from the canonical value.

**Write path:**
1. During ingestion, the first source's value for a field becomes the canonical value (written to the entity table).
2. When a subsequent source provides a **different** value for the same field, an assertion is created with `status = 'disputed'`, and the original canonical value also gets an assertion record.
3. During curation, the reviewer can change which assertion is `accepted`, which updates the canonical table. The former canonical value's assertion moves to `disputed` or `rejected`.
4. Fields that are undisputed have no assertion rows — the canonical table is the only record.

This means: queries against `masters`/`schools`/etc. always return the current accepted truth. The `assertions` table is only consulted when showing disputed facts on public pages or during review.

### Review Workflow (Generic)

Review status applies to **any entity or field**, not just biographies. A generic `review_status` table tracks the editorial state of any piece of content:

```
review_status (
  id TEXT PK,
  entity_type TEXT,     -- 'master', 'temple', 'school', 'teaching', 'event', 'transmission'
  entity_id TEXT,
  field_name TEXT,      -- NULL = entire entity, or specific field like 'biography', 'birth_year'
  locale TEXT,          -- NULL for non-localized fields
  status TEXT,          -- 'draft' | 'needs_review' | 'reviewed' | 'approved' | 'flagged'
  reviewer TEXT,
  reviewed_at TEXT,
  notes TEXT
)

audit_log (
  id TEXT PK,
  entity_type TEXT,
  entity_id TEXT,
  field_name TEXT,
  action TEXT,          -- 'create' | 'update' | 'review' | 'approve' | 'flag'
  old_value TEXT,
  new_value TEXT,
  actor TEXT,
  timestamp TEXT
)
```

### Search & Multilingual Normalization

Aliases and transliterations live in the canonical schema, not just reconciliation scripts:

```
search_tokens (
  id TEXT PK,
  entity_type TEXT,     -- 'master', 'temple', 'school', 'teaching'
  entity_id TEXT,
  token TEXT,           -- normalized search token (lowercased, diacritics stripped)
  original TEXT,        -- original form before normalization
  locale TEXT,
  token_type TEXT       -- 'name' | 'alias' | 'transliteration' | 'romanization'
)
```

- At ingestion, every name variant (pinyin, romaji, Wade-Giles, McCune-Reischauer, original CJK) generates search tokens
- Fuse.js index built from `search_tokens` table at build time
- Slug generation uses `pinyin` library for Chinese characters. Japanese kanji romanization is **not automated** — historical names require curated readings (e.g., 道元 → "Dōgen" not the on'yomi/kun'yomi output). Japanese readings are stored as `master_names` entries with `name_type = 'alias'` and populated from source data or manual curation. `wanakana` is used only for kana↔romaji conversion where kana readings are available.
- Locale fallback chain: requested locale → English → first available locale

### Media Assets

```
media_assets (
  id TEXT PK,
  entity_type TEXT,
  entity_id TEXT,
  type TEXT,            -- 'portrait' | 'calligraphy' | 'photo' | 'painting' | 'scroll'
  storage_path TEXT,    -- relative path in /public/media/ or external URL
  source_url TEXT,      -- original source
  license TEXT,         -- 'public_domain' | 'cc_by' | 'cc_by_sa' | 'fair_use' | 'unknown'
  attribution TEXT,     -- credit line
  alt_text TEXT,        -- accessibility
  width INT, height INT,
  created_at TEXT
)
```

**Media policy:** Phase 1 collects metadata and URLs only — no bulk downloading. Phase 2+ adds a media pipeline (download, generate derivatives/thumbnails, verify rights). Only `public_domain` and `cc_by`/`cc_by_sa` assets display publicly. `fair_use` requires manual review. `unknown` assets are not displayed until rights are resolved.

### Database Schema (Drizzle ORM / SQLite)

Core tables — see entity definitions above for field details:

```
-- Core graph
masters (id TEXT PK, slug TEXT UNIQUE, birth_year INT, birth_precision TEXT, birth_confidence TEXT, death_year INT, death_precision TEXT, death_confidence TEXT, ordination_year INT, ordination_precision TEXT, school_id TEXT FK, generation INT)
master_transmissions (id TEXT PK, student_id TEXT FK, teacher_id TEXT FK, type TEXT [primary|secondary|disputed], is_primary BOOLEAN, notes TEXT)
master_names (id TEXT PK, master_id TEXT FK, locale TEXT, name_type TEXT [dharma|birth|honorific|alias], value TEXT)

-- Content
master_biographies (id TEXT PK, master_id TEXT FK, locale TEXT, content TEXT)

-- Schools
schools (id TEXT PK, slug TEXT UNIQUE, tradition TEXT, parent_id TEXT FK, founder_id TEXT FK, founded_year INT, founded_precision TEXT, founded_confidence TEXT, practices TEXT, active BOOLEAN)
school_names (id TEXT PK, school_id TEXT FK, locale TEXT, value TEXT)

-- Temples
temples (id TEXT PK, slug TEXT UNIQUE, lat REAL, lng REAL, region TEXT, country TEXT, founded_year INT, founded_precision TEXT, founded_confidence TEXT, founder_id TEXT FK, school_id TEXT FK, status TEXT)
temple_names (id TEXT PK, temple_id TEXT FK, locale TEXT, value TEXT)
master_temples (master_id TEXT FK, temple_id TEXT FK, role TEXT [founded|resided|abbot])

-- Teachings
teachings (id TEXT PK, slug TEXT UNIQUE, type TEXT, author_id TEXT FK, collection TEXT, era TEXT)
teaching_content (id TEXT PK, teaching_id TEXT FK, locale TEXT, title TEXT, content TEXT)
teaching_relations (teaching_id TEXT FK, related_id TEXT FK, relation_type TEXT)

-- Events (minimal, for timeline foundation)
events (id TEXT PK, slug TEXT UNIQUE, type TEXT, date_start INT, date_start_precision TEXT, date_end INT, date_end_precision TEXT, lat REAL, lng REAL, region TEXT)
event_names (id TEXT PK, event_id TEXT FK, locale TEXT, value TEXT)
event_descriptions (id TEXT PK, event_id TEXT FK, locale TEXT, content TEXT)
event_masters (event_id TEXT FK, master_id TEXT FK, role TEXT)
event_temples (event_id TEXT FK, temple_id TEXT FK, role TEXT)
event_schools (event_id TEXT FK, school_id TEXT FK, role TEXT)

-- Provenance
sources (id TEXT PK, type TEXT, title TEXT, author TEXT, url TEXT, publication_date TEXT, reliability TEXT)
ingestion_runs (id TEXT PK, source_id TEXT FK, run_date TEXT, script_name TEXT, status TEXT [success|partial|failed], record_count INT, notes TEXT)
source_snapshots (id TEXT PK, source_id TEXT FK, ingestion_run_id TEXT FK, snapshot_date TEXT, content_hash TEXT, archive_url TEXT)
citations (id TEXT PK, source_id TEXT FK, entity_type TEXT, entity_id TEXT, field_name TEXT, excerpt TEXT, page_or_section TEXT)
assertions (id TEXT PK, entity_type TEXT, entity_id TEXT, field_name TEXT, value TEXT, status TEXT [accepted|disputed|rejected])
assertion_citations (assertion_id TEXT FK, citation_id TEXT FK)

-- Review & audit
review_status (id TEXT PK, entity_type TEXT, entity_id TEXT, field_name TEXT, locale TEXT, status TEXT, reviewer TEXT, reviewed_at TEXT, notes TEXT)
audit_log (id TEXT PK, entity_type TEXT, entity_id TEXT, field_name TEXT, action TEXT, old_value TEXT, new_value TEXT, actor TEXT, timestamp TEXT)

-- Search
search_tokens (id TEXT PK, entity_type TEXT, entity_id TEXT, token TEXT, original TEXT, locale TEXT, token_type TEXT)

-- Media
media_assets (id TEXT PK, entity_type TEXT, entity_id TEXT, type TEXT, storage_path TEXT, source_url TEXT, license TEXT, attribution TEXT, alt_text TEXT, width INT, height INT, created_at TEXT)
```

ID generation: `nanoid` (URL-safe, compact, collision-resistant).

Slug generation: English romanization via `pinyin` (Chinese). Japanese kanji → romaji requires curated readings stored as aliases (not automated). `wanakana` used only for kana↔romaji. Disambiguation suffix for slug collisions.

### DAG Validation Rules

Enforced at ingestion and on every write to `master_transmissions`:

1. **No cycles** — DFS cycle detection on insert; reject any edge that creates a cycle
2. **No self-loops** — `student_id ≠ teacher_id`
3. **Temporal consistency** — if both teacher and student have dates with precision ≥ circa: (a) teacher's birth_year < student's birth_year (teacher born before student), and (b) their lifespans must overlap by ≥ 10 years (teacher's death_year - student's birth_year ≥ 10), since transmission requires years of study. Violations are warnings (not blocks) when confidence < high.
4. **At most one primary** — a master may have at most one `is_primary = true` transmission
5. **Orphan detection** — warn (don't block) if a master has no incoming or outgoing edges

### Relationship Graph

```
-- Core (Phase 1) — DAG
Master ──teaches──▶ Master        (dharma transmission; primary, secondary, or disputed edge)
Master ──founded──▶ Temple        (established)
Master ──wrote────▶ Teaching      (authored)
Master ──belongs──▶ School        (lineage affiliation)
School ──branched─▶ School        (historical split)
Event  ──involves─▶ Master,Temple,School (historical context)

-- Future (Phase 2+, requires extended entities)
Temple ──houses───▶ Art           (collection)
School ──practices▶ Practice      (methods used)
```

## 5. Lineage Visualizer

### Visual Metaphor
Lineages flow like **rivers branching through time** — organic, meditative. At low zoom, you see the full sweep of Zen history as branching streams of ink. Zoom in and individual masters appear as luminous ink dots.

The graph is a **DAG, not a tree**. Secondary transmissions render as thinner, dashed ink lines connecting to a master's secondary teacher. Disputed transmissions render as very faint dotted lines. This makes the primary lineage flow visually dominant while showing the full network.

### Interaction Model
- **Zoom & Pan** — Infinite canvas, map-like navigation
- **Time Scrubber** — Timeline bar at bottom; drag through centuries; lineages animate into existence
- **Hover** — Glow effect, name tooltip with dates (showing precision: "~500 CE" for circa, "5th c." for century)
- **Click** — Sidebar panel slides in with master summary, citations, and confidence indicators
- **Double-click** — Navigate to full profile page
- **Focus lineage** — highlights upstream/downstream of a master. Accessed via: button in sidebar panel, long-press on touch, or right-click on desktop (with `preventDefault` on context menu)
- **School filter** — Toggle visibility of individual schools
- **Search** — Find any master, snap to their position
- **Transmission filter** — Toggle primary-only / all / disputed edges

### Technology
- **D3.js** for data handling and **DAG layout** calculation (not tree layout — use `d3-dag` or Sugiyama layered layout for proper DAG positioning)
- **PixiJS** (WebGL) for rendering — D3 computes node positions, PixiJS draws them to a WebGL canvas
- **@pixi/react** for React integration within Next.js pages (client-side only component with `'use client'` directive)
- **Pattern:** D3 DAG layout → position data → PixiJS renderer → Canvas element → React wrapper
- **Graceful degradation:** Disable particle effects when frame rate drops below 30fps. Respect `prefers-reduced-motion` media query (disable all animation, show static graph).

### Visual Details
- Stream width is a visual weight based on the number of known dharma heirs per generation (data already captured in the lineage graph)
- Lines vary in weight and opacity like brush strokes
- School-specific colors (see Brand section)
- Subtle animation: streams have gentle particle flow suggesting water/ink movement (disabled when `prefers-reduced-motion` is set)

### Search
Client-side fuzzy search via **Fuse.js** over a pre-built search index from `search_tokens` table (all name variants, aliases, transliterations across all languages). The index is generated at build time and served as a static JSON file.

**Search behavior by context:**
- **On `/lineage` page:** Results appear in a dropdown; selecting a result snaps the camera to that node and opens the sidebar.
- **On any other page:** Results appear in a dropdown showing name, dates, and school. Selecting a result navigates to the master's profile page (`/masters/[slug]`). A "Show in Lineage" secondary action navigates to `/lineage?focus=[slug]`.
- **Global shortcut:** `Cmd/Ctrl+K` opens the search overlay from any page.

For Phase 4, upgrade to SQLite FTS5 via API route if the dataset grows beyond client-side performance limits.

## 6. Site Structure

### Navigation
Minimal top bar: `禅 ZEN` logo | Lineage | Masters | Schools | Teachings | Temples | Timeline | 🔍 | Language selector

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/lineage` | **Lineage Explorer** | Full-screen animated DAG visualization. THE core experience. |
| `/masters/[slug]` | **Master Profile** | Rich page: bio with citations, multilingual names, teachers/students, teachings, temples, map. Confidence indicators on uncertain data. |
| `/masters` | **Masters Index** | Searchable/filterable directory, grid/list view |
| `/schools/[slug]` | **School Page** | History, practices, sub-branches, embedded mini-lineage |
| `/teachings` | **Teachings & Koans** | Browse by collection, master, or theme |
| `/temples` | **Temple Map** | Interactive map (Leaflet + OpenStreetMap), filter by school/era/status |
| `/timeline` | **Timeline** | Scrollytelling chronological journey (Phase 4 UI — data model defined in Phase 1) |
| `/glossary` | **Glossary** | Multilingual Zen terms with cross-references |
| `/about` | **About** | Project mission, methodology, sources, data provenance policy |

## 7. Data Collection Pipeline

### Step 1 — Source
Parse PDF lineage charts using `pdf-parse` (text extraction) with manual structure annotation where needed. Scrape reference websites using `cheerio` for HTML parsing. All scrapers output to the same intermediate JSON format:

```typescript
interface RawTeacherRef {
  name: string;                     // teacher name as found in source
  edge_type?: 'primary' | 'secondary' | 'disputed';  // if discernible from source
  locator?: string;                 // where in the source this relationship is stated (page, section, row)
  notes?: string;                   // any qualifying text from the source
}

interface RawMaster {
  name: string;
  names_cjk: string;
  dates: string;                    // raw date string, parsed later
  teachers: RawTeacherRef[];        // DAG-aware: array with edge metadata
  school: string;
  source_id: string;                // references stable bibliographic source
  ingestion_run_id: string;         // references this specific scraper run
}
```

Each source outputs to `scripts/data/raw/[source-name].json`. Sources are stable bibliographic records (one per website/work). Each scraper run creates an `ingestion_run` record linked to its source, so the same source can be re-fetched over time without losing prior data.

### Step 2 — Reconcile
Merge and deduplicate masters across sources. Same master appears with different romanizations (Dōgen / Dogen / 道元). Automated matching by: exact CJK character match, date overlap, known alias lookup table (`scripts/data/aliases.json`). Ambiguous cases flagged in `scripts/data/review-queue.json` — reviewed via a CLI prompt script (`scripts/review-matches.ts`) that shows candidates side-by-side and accepts merge/skip/manual-link commands.

During reconciliation, parse raw date strings into structured dates with `date_precision` and `date_confidence`. Generate `search_tokens` for all name variants.

**DAG validation** runs after reconciliation: cycle detection, temporal consistency checks, orphan warnings.

### Step 3 — Enrich
AI-assisted content generation using Claude API. For each master in the canonical list, generate: biography, key teachings, historical context, temple associations, connections to broader traditions. Prompts stored in `scripts/prompts/`. Output as JSON to `scripts/data/enriched/[slug].json`. Rate-limited with checkpoint/resume support (completion tracked in `scripts/data/enrichment-manifest.json`).

**Grounded citation model:** The enrichment prompt receives pre-loaded source excerpts (from `sources` and `source_snapshots`) with their `source_id` and `citation_id` values. Claude must cite only from these provided excerpts using the supplied IDs — no open-ended citation. The prompt structure is:

```
Given the following source materials for [master name]:
[SOURCE_ID: src_001] "excerpt from Dumoulin, Zen Buddhism: A History, vol 1, p.142..."
[SOURCE_ID: src_002] "excerpt from Ferguson, Zen's Chinese Heritage, p.87..."

Write a biography citing only from the above sources using [SOURCE_ID] inline references.
```

This prevents fabricated citations. AI-generated content is additionally tagged with a dedicated `source` record of `type = 'ai_generated'` and `reliability = 'ai_generated'`, linked to the specific enrichment run.

### Step 4 — Translate
Generate translations for all content in target languages using Claude API. Buddhist terminology consistency enforced via a glossary file (`scripts/data/glossary.json`) included in translation prompts. Output to `scripts/data/i18n/[locale]/[slug].json`. Same checkpoint/resume pattern as Step 3.

### Step 5 — Curate
Human review via a lightweight Next.js admin page at `/admin/review` (gated by `ADMIN_ENABLED=true` env var; not set in production deployment). Shows each entity with review status, citations, confidence indicators, and approve/edit/flag actions. Review actions recorded in `review_status` and `audit_log` tables.

**Citations are visible during review** — the reviewer sees which source backs each fact and can verify, dispute, or add sources.

### Pipeline Operational Requirements

**Idempotency:** Every script (seed-sources, extractors, reconciliation, seed-db) must be safe to rerun. This means:
- Upserts (ON CONFLICT UPDATE) instead of bare inserts
- Deterministic IDs derived from content (e.g., `nanoid` seeded from `source_id + entity_name`, or content-addressed hashing) so re-running produces the same IDs
- Content hashes on source snapshots to detect actual changes vs. no-ops
- Re-running an extractor with unchanged source data produces identical output

**Testing:** Fixture-based tests with golden outputs:
- Each extractor has a fixture file (`tests/fixtures/[source]-sample.html` or `.pdf`) and a golden output (`tests/golden/[source]-expected.json`)
- Reconciliation has test cases for: exact CJK match, date-based match, alias match, ambiguous case (goes to review queue), no-match (passes through)
- DAG validation has test cases for: valid DAG, cycle detection, self-loop, temporal violation, duplicate primary edge
- Tests run via `vitest` and are required to pass before `seed-db` runs

## 8. Project Phases

### Phase 1: Data Foundation (START HERE)
- Set up Next.js project with TypeScript
- Define full database schema (all tables including events, provenance, review, search_tokens, media_assets)
- Build extraction scripts (PDF + 4 web scrapers)
- Build reconciliation pipeline with DAG validation
- Populate with lineage data from all source charts
- Generate search tokens for all name variants
- Target: ~200-500 well-documented masters with lineage links, provenance tracked, across Soto, Rinzai, Sanbo

**Phase 1 exit criteria:**
- DAG validation passes (no cycles, no self-loops, temporal consistency)
- Every master has ≥ 1 citation for lineage placement
- Source coverage: data from ≥ 4 of the 6 reference sources
- All name variants generate search tokens
- `scripts/validate-graph.ts` exits 0

### Phase 2: Lineage Visualizer MVP
- Build core interactive lineage explorer
- Sumi-e aesthetics with D3 DAG layout + PixiJS
- Implement zoom, pan, time scrubber, node interactions
- Render primary/secondary/disputed edges differently
- Master sidebar with essential bio, citations, confidence indicators
- Graceful degradation for reduced motion and low-powered devices

**Phase 2 exit criteria:**
- DAG renders correctly with no overlapping edges
- 60fps on desktop with full dataset; 30fps on mobile
- `prefers-reduced-motion` disables all animation
- Search index < 500KB gzipped
- Lighthouse accessibility score ≥ 90

### Phase 3: Encyclopedia Content
- AI-assisted profile generation for all masters (with citations)
- Build rich profile pages, school pages, teachings browser
- Implement i18n infrastructure and multi-language content
- Add temple map with Leaflet + OpenStreetMap
- Admin review page with citation verification

### Phase 4: Timeline & Polish
- Build immersive scrollytelling timeline (Event entity already in schema)
- Historical events, cultural context, broader Buddhism connections
- Global search upgrade (FTS5 if needed)
- Glossary, SEO optimization, performance tuning
- Media pipeline (downloads, derivatives, rights verification)
- Deployment and launch

## 9. Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom sumi-e design tokens |
| Visualization | D3.js + d3-dag (DAG layout) + PixiJS (WebGL rendering) |
| Maps | Leaflet + OpenStreetMap (free, no API key required) |
| Database | SQLite (via Drizzle ORM) for local dev; Turso for production (SQLite-compatible, same schema). Vercel serverless functions connect to Turso via `@libsql/client` in HTTP mode. |
| IDs | nanoid (URL-safe, compact) |
| CJK romanization | pinyin (Chinese); wanakana (kana↔romaji only); Japanese kanji readings curated manually |
| Search | Fuse.js (client-side fuzzy search over search_tokens) |
| i18n | next-intl (mature, App Router support, ICU message format) |
| Content | MDX for static pages (/about); JSON/DB for structured data |
| Deployment | Vercel |
| Data scripts | Node.js scripts in `/scripts/` directory |

## 10. Data Sources

- Chart-of-the-Chan-Ancestors.pdf (local, already collected)
- Tibetan Buddhist Encyclopedia — Zen lineage charts
- Terebess Zen lineage page (Hungarian/multilingual)
- Cosmos Chan lineage transmission charts
- Mountain Moon Sanbo-Zen lineage chart
- Wikipedia — Zen lineage charts article
- Additional scholarly sources via AI research

## 11. Non-Functional Requirements

### Data Integrity
- DAG validation on every write to `master_transmissions` (no cycles, no self-loops, temporal consistency)
- `scripts/validate-graph.ts` — comprehensive integrity check: cycle detection, orphan detection, citation coverage, temporal consistency. Run in CI and before deployment.
- Every fact with `source.reliability ≠ 'authoritative'` must display a confidence indicator on public pages

### Accessibility
- Lineage visualizer: keyboard navigation (Tab through nodes, Enter to select, Escape to close sidebar)
- Canvas content has ARIA labels and a text-based fallback view (`/lineage?view=list`)
- All media assets require `alt_text` before display
- Lighthouse accessibility score ≥ 90
- Respect `prefers-reduced-motion` (disable animations, show static graph)
- Respect `prefers-color-scheme` (light mode only for v1, but don't break in dark OS settings)

### Performance
- Lineage visualizer: 60fps on desktop, 30fps on mobile with full dataset
- Search index: < 500KB gzipped
- Initial page load (LCP): < 2.5s
- Search latency: < 100ms client-side
- Visualizer: viewport culling — only render nodes visible in the current viewport + 1 screen buffer
