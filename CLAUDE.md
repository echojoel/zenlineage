# CLAUDE.md — project conventions for agents

This file is project-level guidance for Claude Code / agents working in the
`zen` repo (zenlineage.org). Read before making changes.

## Deployment platform

This project is deployed on **Cloudflare Pages** (not Vercel). Do not suggest
Vercel products, `vercel` CLI commands, or Vercel-specific configuration.

- Runtime: `@opennextjs/cloudflare` (OpenNext adapter)
- Deploy command: `npm run deploy` (builds, packages `out-cf/`, then deploys)
- Publish-only: `npm run deploy:cf` (skips the build, ships existing `out-cf/`)
- Config: `wrangler.toml`
- Types: `@cloudflare/workers-types`

Packaging (`npm run package:cf`) keeps the route-level RSC payloads
(`<route>.txt`) but strips the per-segment `__next.*.txt` prefetch files to
stay under CF Pages' 20,000-file limit (`scripts/check-cf-filecount.ts`
guards this). Client-side navigation works through the route payloads;
viewport prefetching is disabled site-wide via `src/components/Link.tsx`
(a lint rule forbids importing `next/link` directly), which also drives
the `<NavProgress>` loading bar. Do not reintroduce blanket `*.txt`
stripping — it 404s every navigation fetch and forces full page reloads.

To deploy: run the deploy command above, or push to the linked branch and let
Cloudflare Pages CI pick it up.

### Deploy credentials

`wrangler pages deploy` authenticates from the process environment, and npm
scripts do not load `.env`. The publish step therefore goes through
`scripts/deploy-cf.sh`, which exports `CLOUDFLARE_API_TOKEN` from `.env`
when it is not already set, and stops with a readable message when no token
is available at all.

Do not call `wrangler pages deploy` directly. Without the token in its
environment wrangler silently falls back to the OAuth token cached in
`~/.wrangler`, and once that stops refreshing it fails with a bare
`Failed to fetch auth token: 400 Bad Request` — which reads like a
Cloudflare outage rather than "the API key is sitting in `.env`".

An already-exported `CLOUDFLARE_API_TOKEN` takes precedence over `.env`, so
CI can supply its own. `.env` is gitignored; keep it that way.

### Build-time environment variables

Both are optional and read at build time. Set them in the Cloudflare Pages
project settings (Settings → Environment variables) so production builds pick
them up — a local `.env` only affects local builds. Each is gated: when unset,
the corresponding tag or script is omitted entirely rather than emitted empty.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console ownership token (the "HTML tag" method — the token only, not the whole tag). Without it, Search Console cannot be verified and we have no indexation data. |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Cloudflare Web Analytics beacon token. Cookieless and collects no personal data, so no consent banner is required. Leave unset to ship zero third-party script. |

## SEO invariants

- **Never `Disallow: /data/`** (or any path under it) in `src/app/robots.ts`.
  Those JSON files are content, not private data: `/lineage` fetches
  `/data/graph.json`, `/practice` fetches `/data/temples.json`, and site
  search fetches `/data/search-index.json`, all client-side. Googlebot
  renders JavaScript but will not fetch a robots-forbidden resource, so
  disallowing `/data/` leaves those pages permanently empty to crawlers. It
  also contradicts `/llms.txt`, which points agents at `/data/graph.json`.
- **Don't put link lists in permanently-hidden containers.** `.lineage-seo-intro`
  is `clip: rect(0,0,0,0)` and `.lineage-page` is `height:100vh; overflow:hidden`.
  A few hundred links no user can reach reads as a hidden-link scheme whichever
  mechanism hides them. Every master is already reachable via `/masters`, and
  each `/masters/<slug>` links to its `/lineage/<slug>`.
- Master lineage pages (`/lineage/[slug]`, ~466 of them) must carry content
  specific to their subject — the succession chain, the named teacher, the
  attributed teachings. They were once ~143 templated words each, which at
  that scale reads as near-duplicate boilerplate.

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
- 0 duplicate suspects (see below)
- 0 schools / timeline events with uncited paragraphs
- Transmissions lacking citation rows: bounded (canonical-imported
  edges may still trail; track is moving toward 0)

### One place, one pin

`scripts/check-temple-duplicates.ts` (also surfaced in the audit as
"Duplicate suspects") flags the same place of practice seeded twice.
Nothing else reconciles the hand-curated rows in `seed-temples.ts`
against the rows generated from `raw-places/*.json`, and slugs are the
primary key, so `templo-seikyuji` and `seikyuji-sevilla` both shipped —
one in its olive grove, one in the middle of Seville, 57km apart.

When it flags a cluster, do one of two things — never silence it:

1. **One place.** Add a `DUP_PATTERNS` entry in
   `scripts/build-europe-temples.ts` so the generated copy defers to the
   curated row, then re-run the builder. Anchor the pattern tightly: a
   bare `/il cerchio/` also swallows Enkuji Il Cerchio Vuoto, and a bare
   `/ens[oō]ji/` swallows anything ending in -sōji.
2. **Two places.** Add the pair to `VERIFIED_DISTINCT` in
   `scripts/temple-duplicates.ts` **with the reason**. An entry without an
   argument attached is indistinguishable from a duplicate someone muted.

Two `city` pins sharing a town centroid is expected and is not flagged;
two `exact` pins on one doorstep is.
