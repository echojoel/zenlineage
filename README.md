# Zen Lineage

**[zenlineage.org](https://zenlineage.org)** — An open source encyclopedia of Chan and Zen history.

Browse 556 masters across 25 schools, trace teacher-student lineages through an interactive graph, and read sourced biographies, teachings, and koans spanning 2,500 years — from Shakyamuni Buddha to contemporary teachers. Find active Zen practice places across 51 countries.

---

## A note on images and content

This encyclopedia draws on publicly available sources, historical paintings, and Wikimedia Commons images. We have made every effort to be accurate and respectful.

**If you are depicted in this project and would like your image removed, or if you find any error in how a master, teacher, or tradition is represented, please:**

- Open an issue on this repository

We will promptly honor any removal or correction request. We sincerely apologize for any errors or misrepresentations — this is a labor of respect for the tradition, and we welcome guidance from practitioners and scholars.

---

## What's here

|                        |                                                                              |
| ---------------------- | ---------------------------------------------------------------------------- |
| **Masters**            | 556 across Chan, Zen, Seon, and Thiền traditions                             |
| **Schools**            | 25 — Linji, Caodong, Rinzai, Soto, Jogye, Plum Village, Sanbō Zen, and more |
| **Transmissions**      | 578 sourced teacher-student dharma transmission records                      |
| **Places of practice** | 1,657 active dōjō, monasteries, and lay sanghas across 51 countries          |
| **Teachings**          | 1,021 — koans, verses, dialogues, and proverbs                               |
| **Koan collections**   | Mumonkan (48), Blue Cliff Record, Denkoroku, Jingde Chuandenglu              |
| **Biographies**        | Sourced narratives for the canonical corpus                                  |
| **Citations**          | 6,800+ source attributions                                                   |

## Pages

| Route                         | Description                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| `/`                           | Home                                                                                   |
| `/lineage`                    | Interactive lineage graph — pan, zoom, filter by school, time scrubber, fuzzy search   |
| `/masters`                    | Searchable grid of all masters with school and era filters                             |
| `/masters/[slug]`             | Master detail — names, dates, school, lineage, biography, teachings, portrait, sources |
| `/schools`                    | All schools with descriptions and master counts                                        |
| `/schools/[slug]`             | School detail — tradition, history, notable members, hero portrait                     |
| `/practice`                   | World map of Zen practice places — pan, zoom, filter by school                         |
| `/proverbs`                   | Proverbs with theme and school filters; Koans tab with expandable case browser         |
| `/teachings/[slug]`           | Teaching detail — full text, attribution, master roles, citations                      |
| `/timeline`                   | Chronological timeline of masters                                                      |
| `/glossary`                   | Key terms across Chan, Zen, Seon, and Thiền with school links                          |
| `/sutras`                     | Heart, Diamond, Platform, and Lotus sūtras                                             |
| `/about`                      | What Zen is, where the word comes from, the three pillars, and historical development  |

## Stack

- **Next.js 16** App Router (server components + client interactivity)
- **Drizzle ORM** + **LibSQL/SQLite** (`zen.db`)
- **PixiJS v8** + **d3-dag** + **d3-zoom** for the lineage graph
- **Fuse.js** for fuzzy search
- **sharp** for image optimization
- **Tailwind CSS v4** + custom CSS variables
- Deployed on **Cloudflare Pages** via `@opennextjs/cloudflare`

## Getting started

```bash
# Install dependencies
npm install

# Seed the database (sources, masters, schools, transmissions, citations, biographies, teachings)
npm run prebuild

# Start the dev server
npm run dev
```

The site will be available at `http://localhost:3000`.

> **Note:** The database (`zen.db`) is rebuilt from seed scripts on every `npm run prebuild`. Never edit the DB directly — changes will be lost on the next build. All data changes must go through seed scripts.

## Commands

```bash
npm run dev               # Dev server
npm run prebuild          # Rebuild zen.db from all seed scripts
npm run build             # Production build (runs prebuild first)
npm run audit             # Coverage audit (citations, images, biographies)
npm run lint              # ESLint
npm run test              # Vitest

# Data scripts
DATABASE_URL=file:zen.db npx tsx scripts/audit-transmissions.ts
DATABASE_URL=file:zen.db npx tsx scripts/check-exit-criteria.ts
npx tsx scripts/validate-graph.ts
```

## Data pipeline

```
raw sources (PDF, HTML scrapers, curated JSON)
  -> scripts/data/raw/*.json
  -> scripts/seed-db.ts          # masters, schools, transmissions, citations
  -> scripts/seed-biographies.ts
  -> scripts/seed-teachings.ts
  -> scripts/seed-temples.ts
  -> scripts/generate-static-data.ts   # bakes graph.json, search-index.json, etc.
  -> zen.db + public/data/
  -> Next.js reads from zen.db at build time
```

Images are fetched from Wikipedia's pageimages API, manually verified, then optimized to WebP:

```
scripts/fetch-kv-images.ts         # Wikipedia pageimage API + manual overrides
scripts/register-disk-images.ts    # Re-binds existing public/masters/*.webp
  -> public/masters/{slug}.webp
  -> media_assets + citations in zen.db
```

Thumbnail sizes for the lineage graph:

```
scripts/generate-thumbnails.ts
  -> public/masters/thumb/{slug}-48.webp
  -> public/masters/thumb/{slug}-96.webp
  -> public/masters/thumb/{slug}-200.webp
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
| `src_mumonkan_senzaki_1934`           | Mumonkan — Senzaki/Reps 1934 translation          |
| `src_blue_cliff_record_shaw_1961`     | Blue Cliff Record — R.D.M. Shaw 1961 translation  |
| `src_platform_sutra_yampolsky_1967`   | Platform Sutra — Yampolsky 1967 translation       |
| `src_editorial_biographies`           | Editorial biographies (internal)                  |
| `src_editorial_teachings`             | Editorial teachings (internal)                    |

## Quality rules

- Nothing gets published without item-level citations
- Dates carry precision (`exact` / `circa` / `century` / `unknown`) and confidence (`high` / `medium` / `low`)
- External sources and internal editorial overlays are kept separate
- Images sourced only from Wikipedia pageimages (curated) or manually verified Wikimedia Commons files
- Public lineage graph invariant: `Shakyamuni Buddha` is the only allowed root
- Transmission evidence is tiered: A (≥2 institutional sources), B (≥2 hostnames), C (1 credible source), D (unverifiable)

## Contributing

Contributions are welcome — whether you're a practitioner, scholar, developer, or simply interested in Zen history.

- **Data corrections** — Fix dates, names, lineage connections, or biographical details
- **New masters** — Add masters missing from the encyclopedia
- **Teachings** — Contribute koans, dialogues, verses, or proverbs (public domain or properly licensed)
- **Images** — Source portraits from Wikimedia Commons with proper attribution
- **Code** — Improve the UI, graph visualization, search, or data pipeline

### How to contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b add-master-xyz`)
3. Make your changes with appropriate citations
4. Run `npm run build` to validate
5. Open a pull request with a description of your changes

For data contributions, please include sources. Citation integrity is taken seriously — every fact should be traceable.

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
