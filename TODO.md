# Zen Encyclopedia TODO

This file is the ordered execution plan for the next stages of the project. Work top to bottom. Do not open a later phase until the current phase meets its exit criteria.

## How to use this file

- Mark completed items with `[x]`.
- Keep tasks in order unless a blocker requires a small prerequisite fix.
- Update the baseline numbers in this file and in `README.md` whenever the dataset materially changes.
- End every meaningful ingestion or reconciliation pass with:

```bash
npx tsx scripts/reconcile.ts
npx tsx scripts/seed-db.ts
npx tsx scripts/seed-biographies.ts
npx tsx scripts/check-exit-criteria.ts
npx tsx scripts/validate-graph.ts
npx next build
npm test
```

## Current baseline

As of the current local workspace:

| Metric | Current |
|-------|---------|
| Registered sources | 9 |
| Active cited sources | 8 |
| Canonical masters | 231 |
| Schools | 14 |
| Transmission edges | 70 |
| Masters with biographies | 50 |
| Masters with teachings | 0 |
| Masters with images | 5 hardcoded fallbacks, 33 uncited rows in `media_assets`, 0 published |
| Biographies with item-level citations | 50 |
| Media assets with item-level citations | 0 |
| Orphan masters | 153 |
| Masters without school assignment | 0 |
| Known missing canonical match | none |

## Phase 0: Operating discipline

- [ ] Keep provenance strict. No local curated dataset may impersonate an external source.
- [ ] Keep source additions small. Add at most 1 or 2 new sources in a single pass.
- [ ] Do not publish uncited biographies, teachings, images, school assignments, or lineage edges.
- [ ] Do not accept a new extractor without a reproducible command, fixture coverage, and a clear `source_id`.
- [ ] Do not remove audit warnings by weakening the audit. Fix the underlying data or logic.

Exit criteria: these rules are followed for every phase below.

## Publication contract

These rules apply to every biography, teaching, koan, proverb-like saying, image, and lineage fact that appears in the public UI.

### Minimum source and citation requirements

- Every published item must point to a registered `sources` row with a real `source_id`.
- Every published item must be traceable to an `ingestion_runs` record or a documented editorial import path.
- Every published item must have item-level citations that point at the content row itself, not only at the parent master row.
- Every citation must use the correct `entity_type` and `entity_id` for the row it supports.
- Every citation must include enough locator detail to re-find the claim in the upstream source: page, section, case number, chapter, image file name, or equivalent.
- Every citation should include a useful excerpt or evidence note. Avoid empty or meaningless citation rows.
- Every citation must reference a source that is actually appropriate for that field. Do not use a lineage chart as support for an image license or a quote translation.
- If attribution, provenance, locator data, or licensing is unclear, keep the content in draft and do not publish it.

### Content-type publish rules

- Biographies:
  - the `master_biographies` row may exist as draft text, but it is not publishable until `citations.entity_type = 'master_biography'`
  - each paragraph or claim cluster should be traceable to at least one supporting source
  - dates, teacher links, place claims, and famous anecdotes need explicit support, not just general-source coverage
- Teachings:
  - every `teachings` row needs item-level citations with `citations.entity_type = 'teaching'`
  - quote-like content must carry attribution status, work or collection title, locator, translator or edition when applicable, and license status
  - koans and encounter dialogues must preserve case metadata and multiple-master roles where needed
  - unattributed proverb-like sayings must be marked as traditional or unresolved instead of being assigned to a master without evidence
- Images:
  - every image needs a `media_assets` row with `entity_type = 'master'`, `entity_id = <master.id>`, and `type = 'image'`
  - every image needs either `storage_path` or `source_url`
  - every image needs `attribution`, `license`, and `alt_text`; width and height should be stored when available
  - every image must have item-level citations with `citations.entity_type = 'media_asset'`
  - a local asset file or remote URL must actually resolve; metadata alone is not enough

### Verification before publish

- Run `scripts/check-exit-criteria.ts` and confirm uncited biography, teaching, and media counts move in the expected direction.
- Spot-check the rendered master page and confirm the content appears only after item-level citations exist.
- Reject any import that creates content rows without matching citations, or citations without enough locator detail to audit later.

## Phase 1: Immediate data correctness blockers

Goal: eliminate the known correctness gaps that still block reliable expansion.

- [x] Add or reconcile the missing canonical master for `hakuin-ekaku`, or update the biography seed to point at the correct existing canonical entity if one already exists under another name.
- [x] Resolve the remaining reconcile review queue item and document the decision.
- [ ] Audit Tier 1 masters for bad merges, alias pollution, wrong teachers, or wrong date parsing.
- [x] Confirm that all short-slug junk records are gone from reconciled output and the database.
- [ ] Review any remaining alias oddities introduced by raw chart parsing and normalize them before adding more sources.
- [x] Preserve the Chan chart `koanRefs` data end to end instead of dropping it after PDF extraction.
- [x] Add focused regression tests for every bug fixed in this phase.

Exit criteria:

- `scripts/reconcile.ts` reports no obviously bad placeholder or parse-artifact masters.
- `seed-biographies.ts` runs with zero skipped entries caused by missing canonical records.
- No suspicious short slugs appear in `scripts/check-exit-criteria.ts`.

## Phase 2: Provenance and ingestion bookkeeping

Goal: make every import traceable, reproducible, and field-level citable.

- [x] Make every extractor write an `ingestion_runs` row.
- [x] Persist a `source_snapshots` row or equivalent source fingerprint for every ingest.
- [ ] Extend citation generation so biographies, teachings, and images can carry first-class citations, not just core master fields.
- [ ] Add validation that content citations target the correct row type: `master_biography`, `teaching`, or `media_asset`, not only the parent `master`.
- [ ] Add validation that citations include actionable locator data and not just a bare source link.
- [ ] Add validation that citations reference a source whose scope actually matches the supported field.
- [ ] Add the missing teaching relationship model needed for koans and encounter dialogues, so a teaching can be linked to multiple masters with roles such as speaker, questioner, respondent, compiler, or commentator.
- [x] Add an audit that flags any biography, teaching, or image row without citation coverage.
- [x] Add an audit that flags any raw dataset whose `source_id` does not match its configured provenance policy.
- [x] Add a single documented command or script for running the full pipeline in order.

Exit criteria:

- Every importable dataset has recorded run metadata.
- Every publishable content table can be traced back to source citations.
- The provenance audit stays clean after a full reseed.

## Phase 3: Tiering and editorial prioritization

Goal: make the coverage plan explicit so effort goes into the highest-value masters first.

- [x] Define the Tier 1 list of 50 masters.
- [ ] Define the Tier 2 list of the next 100 masters.
- [ ] Leave the remaining long-tail masters as Tier 3.
- [x] Store the tier lists in-repo in a stable machine-readable format.
- [x] Document why each Tier 1 master is in scope: founder, patriarch, major lineage bridge, or historically central teacher.

Exit criteria:

- Tier 1 and Tier 2 lists are committed and referenced by future import scripts.
- All later biography, teaching, image, and lineage tasks can target those lists directly.

## Phase 4: Biography coverage

Goal: reach reliable historical coverage before expanding into quotes and media.

- [x] Bring Tier 1 biographies to 100% coverage in `master_biographies`.
- [ ] Bring Tier 2 biographies to at least concise sourced coverage.
- [ ] Add review-state handling for biographies so unreviewed text is distinguishable from reviewed text.
- [ ] Reshape biography seed data so each biography entry carries structured source metadata and locators, not only raw text.
- [x] Seed item-level citations for each biography row using `entity_type = 'master_biography'`.
- [ ] Ensure every biography paragraph can be traced to at least one source.
- [ ] Add spot-check guidance for biography QA: dates, teacher links, transliterations, and claims that sound anachronistic.
- [x] Update the coverage audit so biography completeness can be broken out by tier.

Exit criteria:

- Tier 1 biographies are complete and cited.
- Tier 2 biographies are mostly present and reviewable.
- The biography audit reports by tier, not just global totals.

## Phase 5: Teachings, quotes, koans, and proverb pipeline

Goal: create a disciplined path for importing Zen quotes, koans, proverb-like sayings, and teaching excerpts.

- [ ] Finalize the canonical teaching import shape for `teachings` and `teaching_content`.
- [ ] Define supported content classes: saying, proverb, koan case, encounter dialogue, verse/gatha, sermon excerpt, and instructional text.
- [ ] Define required metadata: author or attribution status, work title, collection, case number where applicable, locale, translator or edition, locator, and license status.
- [ ] Add a way to represent multiple master roles for a teaching, since koans and dialogues often involve more than one figure.
- [ ] Preserve collection-specific structure for koans: collection title, case number, compiler, and commentary lineage.
- [ ] Use the Chan chart `koanRefs` as seed data for linking masters to koan collections and case references where those links can be verified.
- [ ] Decide the treatment of traditional Zen proverbs and unattributed sayings: import only when they can be tied to a source or mark them explicitly as traditional/unresolved rather than falsely assigning them to one master.
- [ ] Reject unattributed internet quote collections and paraphrase-only quote pages.
- [ ] Add deduplication rules for the same saying appearing in multiple translations or collections.
- [ ] Build the first importer for one approved source with clear provenance and licensing.
- [ ] Import teachings for Tier 1 masters only in the first pass.
- [ ] Add UI support for rendering teachings with citations and source metadata.
- [ ] Add distinct presentation for quotes, koans, and proverb-like sayings so the UI does not flatten everything into one generic content block.
- [ ] Add audit coverage for masters with teachings by tier and by content class.
- [ ] Do not publish any teaching item unless the supporting citation reaches the `teachings` row itself and includes a usable locator.

Approved source order for this phase:

1. `Wikisource` where the text is public domain and the attribution is clean.
2. `CBETA` for canonical source references and text alignment.
3. `SAT Daizokyo Database` for canonical reference support.
4. Canonical koan collections such as `Wumenguan / Gateless Barrier`, `Blue Cliff Record`, `Book of Serenity`, and `Denkoroku`, using editions whose attribution and licensing terms are acceptable.
5. `BDK English Tripitaka` only if license and usage terms are verified as acceptable.

Exit criteria:

- The first teaching importer is reproducible and tested.
- Tier 1 teaching records exist only where attribution and licensing are clear.
- Teachings are cited at the item level, not just at the master level.
- Quotes, koans, and proverb-like sayings are distinguishable by type and attribution status.

## Phase 6: Image pipeline

Goal: move from hardcoded fallback images to properly attributed media assets.

- [ ] Define accepted image sources and licensing rules.
- [ ] Import the current 5 hardcoded image fallbacks into `media_assets` with attribution and source URLs.
- [ ] Add required metadata checks for every image: license, attribution, source URL, alt text, and dimensions where available.
- [ ] Attach item-level citations for every `media_assets` row using `entity_type = 'media_asset'`.
- [ ] Verify that every DB image has a working `storage_path` or `source_url` and that the path or URL actually resolves.
- [ ] Add deterministic ordering or primary-image selection so pages do not depend on arbitrary row order when multiple image rows exist.
- [ ] Update the app to prefer `media_assets` over hardcoded image mappings.
- [ ] Remove hardcoded image dependency once DB-backed replacements exist.
- [x] Add coverage audit reporting for DB-backed images versus hardcoded fallbacks.

Image handoff checklist for other agents:

- Create or update the `media_assets` row with:
  - `entity_type = 'master'`
  - `entity_id = <master.id>`
  - `type = 'image'`
  - `storage_path` or `source_url`
  - `attribution`
  - `license`
  - `alt_text`
- Add at least one matching `citations` row with:
  - `entity_type = 'media_asset'`
  - `entity_id = <media_assets.id>`
  - valid `source_id`
  - useful `field_name`, `excerpt`, and `page_or_section` data
- Re-run the audit and confirm the image moved from uncited metadata to publishable content.

Approved source order for this phase:

1. `Wikimedia Commons`
2. Official temple or institution archives with explicit reuse terms
3. Other archival or museum sources only when attribution and license are explicit

Exit criteria:

- `media_assets` is the system of record for published images.
- The audit no longer depends on hardcoded fallback counts as primary image coverage.

## Phase 7: Source expansion

Goal: increase coverage diversity without destabilizing reconciliation.

- [ ] Add `Wikidata` for identifiers, alternate names, and structured date support.
- [ ] Add `Wikimedia Commons` metadata ingestion for image candidates.
- [ ] Add one text-oriented source for biography or teaching enrichment.
- [ ] Add at least one high-quality koan-text source whose case numbering and edition metadata can be preserved.
- [ ] Re-run reconciliation and audit after each added source before accepting the next source.
- [ ] Stop adding sources if the new source creates merge noise, provenance ambiguity, or misleading quote attribution.

Ordered candidate source list:

1. `Wikidata`
2. `Wikimedia Commons`
3. `Wikisource`
4. `CBETA`
5. `SAT Daizokyo Database`
6. A vetted koan-text source for `Gateless Barrier`, `Blue Cliff Record`, `Book of Serenity`, or `Denkoroku`
7. `BDK English Tripitaka` if licensing is confirmed
8. `Cosmos Chan` only after a real extractor and provenance policy exist

Exit criteria:

- Active cited sources increase without introducing new suspicious records.
- Each new source clearly improves one weak area: identities, biographies, teachings, or images.

## Phase 8: Lineage graph quality

Goal: reduce orphan noise and improve the trustworthiness of transmission edges.

- [ ] Classify the 153 orphan masters into categories: truly isolated, missing teacher, missing student, disputed, or incomplete source coverage.
- [x] Reconnect the core early Chan / Linji / Caodong bridge figures via the editorial overlay where the current extractors do not expose teacher relationships.
- [ ] Prioritize orphan reduction for Tier 1 and Tier 2 masters.
- [ ] Add assertions and review-state handling for disputed lineage edges instead of silently choosing one version.
- [ ] Ensure every accepted transmission edge has source support.
- [ ] Add an audit view for masters whose teacher chain is still incomplete.

Exit criteria:

- Tier 1 masters are either connected in the graph or explicitly marked as unresolved with review notes.
- Orphan count decreases for high-value masters without creating speculative edges.

## Phase 9: UI and publishing quality

Goal: ensure the product surfaces the improved data honestly and clearly.

- [ ] Show citations for biographies, teachings, and images in the UI.
- [x] Show review status or draft status for editorial content where appropriate.
- [x] Add explicit empty states for missing biography, teaching, and image coverage.
- [x] Withhold uncited biographies, teachings, and image fallbacks from public master and lineage views.
- [x] Preserve direct cross-school bridge figures in the lineage school filter so real transmission chains do not appear severed at school boundaries.
- [ ] Show teachings grouped or filterable by content class, including quotes, koans, and proverb-like sayings.
- [ ] Show collection and case metadata for koans instead of rendering them as plain quotes.
- [x] Keep headline counts dynamic and DB-backed.
- [ ] Ensure school pages and master pages reflect the canonical taxonomy consistently.
- [ ] Add smoke checks for the key routes after major reseeds.

Exit criteria:

- The UI does not imply completeness where data is partial.
- Users can see where facts came from for every enriched content type.

## Phase 10: Automation and release hygiene

Goal: make the pipeline safe to run repeatedly.

- [x] Add a single script that runs reconcile, seed, biography seed, audit, graph validation, and tests in the correct order.
- [ ] Add CI or an equivalent local release checklist that fails on test, build, or audit regressions.
- [ ] Add a post-ingest checklist for updating `README.md` and this file when baseline counts change.
- [ ] Add a lightweight changelog entry process for important data-model or provenance-policy changes.

Exit criteria:

- A full ingestion pass is reproducible with one documented command sequence.
- Regression checks fail fast before bad data is published.

## Milestone targets

### Milestone A: Stable foundation

- [x] `hakuin-ekaku` resolved
- [x] provenance bookkeeping in place
- [x] no suspicious slugs
- [x] biography seed runs cleanly
- [x] audit output is trustworthy

### Milestone B: Tier 1 encyclopedia

- [x] Tier 1 biographies complete
- [ ] first Tier 1 teachings imported
- [ ] first Tier 1 koans linked with collection and case metadata
- [ ] first vetted proverb-like sayings imported with attribution status
- [ ] first Tier 1 DB-backed images imported
- [ ] Tier 1 lineage edges reviewed

### Milestone C: Tier 2 expansion

- [ ] Tier 2 biographies substantially covered
- [ ] source count increased in a controlled way
- [ ] orphan count reduced for major masters

### Milestone D: Publishable enrichment pipeline

- [ ] hardcoded image fallback dependence removed
- [ ] biographies, teachings, and images all support citations
- [ ] pipeline is reproducible and automated

## Definition of done for the current expansion cycle

- [ ] No masters lack a school assignment unless there is a documented reason.
- [ ] No suspicious slugs or obvious parse-artifact masters remain.
- [x] Tier 1 biographies are complete and cited.
- [ ] Teachings, koans, and proverb-like sayings exist for Tier 1 masters where supportable and licensable.
- [ ] Images are DB-backed with attribution wherever available.
- [ ] New sources are added only through reproducible, auditable import steps.
- [ ] The coverage audit status matches reality and is trusted as the release gate.
