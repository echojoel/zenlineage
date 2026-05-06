# Zen Lineage

**[zenlineage.org](https://zenlineage.org)** — An open, interactive encyclopedia of Zen Buddhist masters, schools, dharma transmission lineages, and active places of practice.

This project aims to make Zen's rich history accessible and explorable. Browse 424 masters across 25 schools, trace teacher-student lineages through an interactive graph, and read sourced biographies, teachings, and koans spanning 2,500 years from Shakyamuni Buddha to modern teachers — and find Zen practice places near you across 51 countries.

---

## A note on images and content

This encyclopedia draws on publicly available sources, historical paintings, and Wikimedia Commons images. We have made every effort to be accurate and respectful.

**If you are depicted in this project and would like your image removed, or if you find any error in how a master, teacher, or tradition is represented, please:**

- Open an issue on this repository

We will promptly honor any removal or correction request. We sincerely apologize for any errors or misrepresentations — this is a labor of respect for the tradition, and we welcome guidance from practitioners and scholars.

---

## What's here

|                   |                                                                                |
| ----------------- | ------------------------------------------------------------------------------ |
| **Masters**       | 424 across Chan, Zen, Seon, and Thiền traditions                               |
| **Schools**       | 25 — Linji, Caodong, Rinzai, Soto, Jogye, Plum Village, Sanbō Zen, and more   |
| **Transmissions** | 423 teacher-student dharma transmission records                                |
| **Places of practice** | 1,594 active dōjō, monasteries, and lay sanghas across 51 countries       |
| **Teachings**     | 758 — koans, verses, dialogues, and proverbs                                   |
| **Images**        | 187 verified master portraits with attribution                                 |
| **Biographies**   | Sourced narratives for the canonical corpus                                    |
| **Citations**     | 6,800+ source attributions                                                     |

## Pages

| Route             | Description                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- |
| `/`               | Home                                                                                   |
| `/lineage`        | Interactive lineage graph — pan, zoom, filter by school, time scrubber, fuzzy search   |
| `/masters`        | Searchable grid of all masters with school and era filters                             |
| `/masters/[slug]` | Master detail — names, dates, school, lineage, biography, teachings, portrait, sources |
| `/schools`        | All schools with descriptions and master counts                                        |
| `/schools/[slug]` | School detail — tradition, history, notable members, hero portrait                     |
| `/practice`       | World map of Zen practice places — pan, zoom, filter by school                         |
| `/proverbs`       | Browsable collection of Zen proverbs with theme and school filters                     |
| `/timeline`       | Chronological timeline of masters                                                      |
| `/about`          | What Zen is, where the word comes from, the three pillars, and historical development  |

## Stack

- **Next.js 16** App Router (server components + client interactivity)
- **Drizzle ORM** + **LibSQL/SQLite** (`zen.db`)
- **PixiJS v8** + **d3-dag** + **d3-zoom** for the lineage graph
- **Fuse.js** for fuzzy search
- **sharp** for image optimization
- **Tailwind CSS v4** + custom CSS variables

## Getting started

```bash
# Install dependencies
npm install

# Seed the database (sources, masters, schools, transmissions, citations, biographies, teachings)
npm run seed

# Start the dev server
npm run dev
```

The site will be available at `http://localhost:3000`.

## Commands

```bash
npm run dev               # Dev server
npm run seed              # Seed everything (idempotent, safe to re-run)
npm run reconcile         # Rebuild reconciled JSON from raw sources
npm run audit             # Coverage audit
npm run pipeline          # Full pipeline: reconcile -> seed -> audit -> build -> test

# Individual steps
npx tsx scripts/validate-graph.ts   # DAG integrity check
npx next build                      # Production build
npx vitest run                      # Run tests
```

## Data pipeline

```
raw sources (PDF, HTML scrapers, curated JSON)
  -> scripts/data/raw/*.json
  -> scripts/reconcile.ts  ->  scripts/data/reconciled/*.json
  -> scripts/seed-db.ts    ->  zen.db
  -> Next.js reads from zen.db
```

Teachings follow a parallel path:

```
scripts/data/raw-teachings/teachings-*.json
  -> scripts/seed-teachings.ts  ->  zen.db
```

Places of practice follow yet another path — per-country research artifacts
are auto-discovered, geocoded, and merged into the seed dataset:

```
scripts/data/raw-places/zen-places-{cc}.json   # one per country (~50)
  -> scripts/build-europe-temples.ts
       (Nominatim geocoding + cache + lineage→school + URL→source mapping)
  -> scripts/data/seed-temples-europe.ts
  -> scripts/seed-temples.ts                   # combined with curated entries
  -> zen.db
```

Images are fetched from Wikipedia's pageimages API, manually verified, then optimized to WebP:

```
scripts/seed-images.ts          # Full run (all masters)
scripts/seed-images-targeted.ts # Targeted run (specific masters with overrides)
  -> public/masters/{slug}.webp
  -> media_assets + citations in zen.db
```

The lineage graph's "Portraits" view uses three downscaled thumbnails per
master so it can paint quickly without shipping full-resolution heroes:

```
scripts/generate-thumbnails.ts  # Runs in `npm run prebuild`; idempotent
  -> public/masters/thumb/{slug}-48.webp   # 1× node sprite, ~2–3 KB
  -> public/masters/thumb/{slug}-96.webp   # 2× / retina + zoom ≥ 1.5
  -> public/masters/thumb/{slug}-200.webp  # zoom ≥ 4 / hover preview
```

`generate-static-data.ts` bakes the three thumbnail paths into
`public/data/graph.json` so the renderer doesn't need a separate manifest.
The graph component (`src/components/LineageGraph.tsx`) loads thumbnails
lazily via viewport frustum culling — only nodes inside the padded
viewport request a texture, and the active size is upgraded as the user
zooms in. Users can switch to a name-only view via the controls
(`?mode=text` URL override; preference persists to `localStorage`).

## Sources

| ID                                    | What                                              |
| ------------------------------------- | ------------------------------------------------- |
| `src_chan_ancestors_pdf`              | Andy Ferguson's lineage chart (Wisdom Experience) |
| `src_tibetan_encyclopedia`            | Tibetan Buddhist Encyclopedia                     |
| `src_terebess`                        | Terebess Asia Online                              |
| `src_cosmos_chan`                     | Cosmos Chan lineage charts                        |
| `src_mountain_moon`                   | Mountain Moon Sanbo-Zen chart                     |
| `src_wikipedia`                       | Wikipedia Zen lineage charts and images           |
| `src_sotozen_founders`                | Soto Zen official founders page                   |
| `src_hardcore_zen_nishijima_students` | Brad Warner on Gudo Nishijima and fellow students |
| `src_zen_deshimaru_history`           | Zen Deshimaru lineage history                     |
| `src_wikisource`                      | Wikisource free library                           |
| `src_mumonkan_senzaki_1934`           | Mumonkan — Senzaki/Reps 1934 translation          |
| `src_blue_cliff_record_shaw_1961`     | Blue Cliff Record — R.D.M. Shaw 1961 translation  |
| `src_platform_sutra_yampolsky_1967`   | Platform Sutra — Yampolsky 1967 translation       |
| `src_editorial_biographies`           | Editorial biographies (internal)                  |
| `src_editorial_teachings`             | Editorial teachings (internal)                    |

## Quality rules

- Nothing gets published without item-level citations
- Dates carry precision (`exact` / `circa` / `century` / `unknown`) and confidence (`high` / `medium` / `low`)
- External sources and internal editorial overlays are kept separate
- Images are sourced only from Wikipedia pageimages (editorially curated) and manually verified before inclusion
- Ambiguous merges are flagged for review rather than auto-accepted
- Public lineage graph invariant: `Shakyamuni Buddha` is the only allowed root. Any master not connected to that backbone stays off the graph until the upstream lineage is sourced.
- Orphan invariant: the canonical graph should not retain zero-edge masters. When a historically important figure lacks a full direct chain, add a clearly labeled reviewed lineage anchor instead of leaving them disconnected.
- Contemporary image invariant: masters born after 1850 or dying after 1950 should not be treated as complete without a cited, publishable portrait or an explicit reviewed exception.

## Contributing

Contributions are welcome! Whether you're a practitioner, scholar, developer, or simply interested in Zen history, there are many ways to help:

- **Data corrections** — Fix dates, names, lineage connections, or biographical details
- **New masters** — Add masters who are missing from the encyclopedia
- **Teachings** — Contribute koans, dialogues, verses, or proverbs (public domain or properly licensed)
- **Images** — Source portraits from Wikimedia Commons with proper attribution
- **Translations** — Help with name romanizations and locale support (Chinese, Japanese, Korean, Vietnamese)
- **Code** — Improve the UI, graph visualization, search, or data pipeline

### How to contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b add-master-xyz`)
3. Make your changes with appropriate citations
4. Run `npm run pipeline` to validate
5. Open a pull request with a description of your changes

For data contributions, please include sources. We take citation integrity seriously — every fact should be traceable to a reference.

### Reporting issues

If you find an error, please [open an issue](https://github.com/echojoel/zenlineage/issues). We especially appreciate reports about:

- Incorrect lineage connections
- Wrong dates or name spellings
- Misattributed or inappropriate images
- Missing schools or traditions
- Inaccurate biographical information

## License

This project is open source. Historical data, biographical content, and lineage information are drawn from public domain sources and openly licensed materials. Images are sourced from Wikimedia Commons under their respective licenses (primarily Public Domain and Creative Commons).

---

Built with care for the tradition.
