# Zen Lineage

**[zenlineage.org](https://zenlineage.org)** — An open, interactive encyclopedia of Zen Buddhist masters, schools, and dharma transmission lineages.

This project aims to make Zen's rich history accessible and explorable. Browse 381 masters across 15 schools, trace teacher-student lineages through an interactive graph, and read sourced biographies, teachings, and koans spanning 2,500 years from Shakyamuni Buddha to modern teachers.

---

## A note on images and content

This encyclopedia draws on publicly available sources, historical paintings, and Wikimedia Commons images. We have made every effort to be accurate and respectful.

**If you are depicted in this project and would like your image removed, or if you find any error in how a master, teacher, or tradition is represented, please:**

- Open an issue on this repository

We will promptly honor any removal or correction request. We sincerely apologize for any errors or misrepresentations — this is a labor of respect for the tradition, and we welcome guidance from practitioners and scholars.

---

## What's here

|                   |                                                     |
| ----------------- | --------------------------------------------------- |
| **Masters**       | 381 across Chan, Zen, Seon, and Thiền traditions    |
| **Schools**       | 15 — Linji, Caodong, Rinzai, Soto, Jogye, and more  |
| **Lineage edges** | 375 teacher-student transmission records            |
| **Teachings**     | 363 — koans, verses, dialogues, and proverbs        |
| **Images**        | 199 verified master portraits                       |
| **Biographies**   | Sourced narratives for the current canonical corpus |
| **Citations**     | 1,700+ source attributions                          |

## Pages

| Route             | Description                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- |
| `/`               | Home                                                                                   |
| `/lineage`        | Interactive lineage graph — pan, zoom, filter by school, time scrubber, fuzzy search   |
| `/masters`        | Searchable grid of all masters with school and era filters                             |
| `/masters/[slug]` | Master detail — names, dates, school, lineage, biography, teachings, portrait, sources |
| `/schools`        | All schools with descriptions and master counts                                        |
| `/schools/[slug]` | School detail — tradition, history, notable members                                    |
| `/proverbs`       | Browsable collection of Zen proverbs with theme and school filters                     |
| `/timeline`       | Chronological timeline of masters                                                      |

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

Images are fetched from Wikipedia's pageimages API, manually verified, then optimized to WebP:

```
scripts/seed-images.ts          # Full run (all masters)
scripts/seed-images-targeted.ts # Targeted run (specific masters with overrides)
  -> public/masters/{slug}.webp
  -> media_assets + citations in zen.db
```

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
