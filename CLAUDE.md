# CLAUDE.md — project conventions for agents

This file is project-level guidance for Claude Code / agents working in the
`zen` repo (zenlineage.org). Read before making changes.

## Data flow and the "seed data is truth" rule

The runtime database (`zen.db` at the repo root) is **ephemeral**. It is
rebuilt on every deploy from the seed scripts:

```
npm run prebuild
  = seed-db.ts
  ⇒ seed-korean-vietnamese.ts
  ⇒ seed-maezumi-lineage.ts
  ⇒ seed-temples.ts
  ⇒ register-disk-images.ts
  ⇒ fetch-kv-images.ts
  ⇒ generate-name-placeholders.ts
  ⇒ generate-static-data.ts
  ⇒ generate-llms-full.ts
```

On Cloudflare Pages, this runs from a clean state every time. Anything you
change *only* in the local DB will be lost on the next build.

### Never run ad-hoc SQL to modify production-visible state

If you find yourself writing `sqlite3 zen.db "INSERT ..."` or `UPDATE ...` to
fix a data problem, **stop**. That mutation only lives on one machine and
will be gone after the next deploy. Every correction must go through:

1. **Canonical / authored data** — edit one of
   - `scripts/data/korean-vietnamese-masters.ts` (KV masters + transmissions)
   - `scripts/data/maezumi-lineage.ts` (Maezumi neighborhood)
   - `scripts/data/seed-temples.ts` (places of practice)
   - `scripts/data/curated-proverbs.ts` (proverbs)
   - `scripts/data/raw/*.json` (raw extracts: upstream datasets)
   - `scripts/data/raw-teachings/*.json` (raw teaching extracts)
   - `scripts/data/themes.json` (theme taxonomy)
   - `src/lib/school-taxonomy.ts` (school definitions, keyTexts, keyConcepts)
   - `src/lib/editorial-tiers.ts` (tier-1 roster)
2. **Schema evolutions** — edit `src/db/schema.ts` AND add a new migration
   under `drizzle/NNNN_*.sql`. If a seed script needs to tolerate a fresh
   DB without `drizzle-kit migrate`, add an idempotent `ALTER TABLE ... ADD
   COLUMN IF NOT EXISTS ...`-style fallback to the relevant seeder (see
   `scripts/seed-temples.ts#ensureTempleSchema` for the pattern).
3. **Then reseed** — run the piece of the pipeline that owns that data,
   verify the rebuilt DB matches, and commit the data files (and any new
   migration / script) together.

### Acceptable direct-DB usage

Read-only queries (`sqlite3 zen.db "SELECT ..."`) for diagnostics are fine.
One-off cleanups during experimentation are fine *if* you also land the
corresponding change in seed data / seed scripts before committing.

## Image pipeline

Every master must end up with a renderable image. Coverage is guaranteed by
three sequential passes at build time:

1. `register-disk-images.ts` — re-binds any `public/masters/*.webp` that
   already exists on disk to a `media_assets` row + citation.
2. `fetch-kv-images.ts` — pulls Wikipedia pageimages (and manually-verified
   Commons fallbacks) for the hand-curated `TARGETS` list; also has an
   `EXTERNAL_PORTRAITS` slot for institutional sources outside Wikimedia.
3. `generate-name-placeholders.ts` — for every remaining master, emits an
   SVG name-card placeholder in the school's colour palette, registered as
   `type='placeholder'` so the UI can render it while still treating it
   differently from a photographed portrait.

Image **provenance rules:**
- Wikipedia pageimage API → safe to automate.
- Wikimedia Commons filenames → only after manual verification (see
  `memory/feedback_image_quality_validation.md`).
- Any external URL → add it to `EXTERNAL_PORTRAITS` only with (a) a direct
  image URL that resolves, (b) a reputable institutional host, (c) clear
  identification of the master on the source page, and (d) explicit
  attribution + license.

## Schema invariants

- Every master has exactly one `media_asset` of type `image` or `placeholder`.
- Every citation's `entity_id` must resolve to a real row of its
  `entity_type`. The seed-db reset is responsible for clearing dangling
  citations for any entity it wipes.
- Every temple has a `url` field; the `/practice` popup always offers a
  link, either to the temple's own site or to the directory that lists it.
- The public `/lineage` graph must have exactly one topological root —
  `shakyamuni-buddha`. Masters not reachable from that root through
  transmission edges are excluded from the graph (and printed in the
  audit), but remain on their individual detail pages.

## Citation conventions

All long-form editorial prose must carry Wikipedia-style inline
footnote markers. The rule is **paragraph-level density**: every
paragraph (a `\n\n`-separated block) of:

- master biographies (`scripts/seed-biographies.ts` → `bio.content`)
- school `summary`, `practice`, and `mastersIntro`
  (`src/lib/school-taxonomy.ts`)
- timeline event `description` (`src/lib/timeline-editorial.ts`)

must contain at least one `[N]` marker that resolves to a footnote
entry in the same record's `footnotes[]` / `citations[]` array.
`scripts/check-exit-criteria.ts` enforces this and lists offenders.

Footnote sources must be either:

1. A registered source ID in `scripts/seed-sources.ts` (preferred —
   gives the audit a stable handle and lets `CiteThis` export
   formatted bibliographic entries), or
2. A direct external URL (Wikipedia article, Sōtōshū page,
   academic publication). The renderer accepts both shapes.

Transmissions (lineage edges) carry source attribution via the
authored `sourceIds[]` arrays in
`scripts/data/korean-vietnamese-masters.ts`,
`scripts/data/maezumi-lineage.ts`, and
`scripts/data/deshimaru-lineage.ts`. The seeder writes one
`citations` row per source ID with `entity_type='master_transmission'`.
The audit reports edges with no citation row.

Image-citation rules (Wikipedia pageimage vs Commons manual
verification) are documented in the **Image pipeline** section above
and `memory/feedback_image_quality_validation.md`.

## Audit

Run `DATABASE_URL=file:zen.db npx tsx scripts/check-exit-criteria.ts`
after any substantive data change. Target state:

- 0 tier-1 orphans
- 100% masters with images
- 100% biographies cited
- 100% teachings cited
- 0 uncited temples
- 0 schools / timeline events with uncited paragraphs
- Transmissions lacking citation rows: bounded (canonical-imported
  edges may still trail; track is moving toward 0)
