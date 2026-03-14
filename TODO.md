# Zen Encyclopedia TODO

Ordered execution plan. Work top to bottom. Do not open a later phase until the current phase meets its exit criteria.

## How to use this file

- Mark completed items with `[x]`.
- Keep tasks in order unless a blocker requires a small prerequisite fix.
- End every meaningful ingestion or reconciliation pass with:

```bash
npm run reconcile   # rebuild reconciled JSON from raw sources
npm run seed        # seed everything: sources, masters, schools, transmissions, citations, biographies, teachings
npm run audit       # coverage audit
npm run pipeline    # or run the full pipeline (reconcile → seed → audit → build → test)
```

## Current baseline

| Metric | Current |
|---|---|
| Registered sources | 15 |
| Active cited sources | 11 |
| Canonical masters | 296 |
| Schools | 14 |
| Transmission edges | 293 |
| Masters with biographies | 50 |
| Masters with teachings | 53 (48 Mumonkan + 5 standalone) |
| Masters with images | 86 cited in `media_assets` |
| Biographies with item-level citations | 50 |
| Media assets with item-level citations | 99 |
| Orphan masters | 0 |

## Publication contract

These rules apply to every biography, teaching, koan, proverb-like saying, image, and lineage fact in the public UI.

### Source and citation requirements

- Every published item must point to a registered `sources` row.
- Every published item must be traceable to an `ingestion_runs` record or documented editorial import.
- Every published item must have item-level citations (`entity_type` = `master_biography`, `teaching`, or `media_asset`).
- Every citation must include locator detail to re-find the claim: page, section, case number, chapter, or equivalent.
- Every citation must reference a source appropriate for that field (don't cite a lineage chart for an image license).
- If attribution, provenance, or licensing is unclear, keep the content in draft.

### Verification

- Run `npm run audit` and confirm uncited counts move in the expected direction.
- Spot-check rendered pages — content only appears after item-level citations exist.

---

## Phase 1: Data correctness *(mostly complete)*

Goal: eliminate correctness gaps that block reliable expansion.

- [x] Reconcile `hakuin-ekaku` canonical master.
- [x] Resolve reconcile review queue items.
- [x] Confirm all short-slug junk records are gone.
- [x] Preserve Chan chart `koanRefs` end to end.
- [x] Add regression tests for every bug fixed.
- [ ] Audit Tier 1 masters for bad merges, alias pollution, wrong teachers, or wrong date parsing.
- [ ] Review remaining alias oddities from raw chart parsing.

Exit criteria: no bad placeholders, biography seed runs cleanly, no suspicious slugs.

## Phase 2: Provenance *(mostly complete)*

Goal: make every import traceable and field-level citable.

- [x] Every extractor writes `ingestion_runs`.
- [x] `source_snapshots` persisted for every ingest.
- [x] Teaching multi-master roles model (`teaching_master_roles` with speaker/commentator/questioner).
- [x] Audit flags uncited biographies, teachings, and images.
- [x] Audit flags raw datasets with mismatched `source_id`.
- [x] Single pipeline command (`npm run pipeline`).
- [x] Biographies, teachings, and images carry first-class citations.
- [ ] Add validation that citation locators include actionable detail, not just a bare source link.
- [ ] Add validation that citation source scope matches the supported field.

Exit criteria: every dataset has run metadata, every content table traces to citations, provenance audit stays clean.

## Phase 3: Tiering *(partially complete)*

Goal: focus effort on highest-value masters first.

- [x] Define Tier 1 list (50 masters).
- [x] Store tier lists in-repo.
- [x] Document why each Tier 1 master is in scope.
- [ ] Define Tier 2 list (~100 masters).
- [ ] Leave remaining masters as Tier 3.

Exit criteria: Tier 1 and Tier 2 lists committed and referenced by import scripts.

## Phase 4: Biography coverage *(Tier 1 complete)*

Goal: reliable historical coverage before expanding into quotes and media.

- [x] Tier 1 biographies at 100% in `master_biographies`.
- [x] Item-level citations for each biography (`entity_type = 'master_biography'`).
- [x] Coverage audit broken out by tier.
- [ ] Tier 2 biographies — concise sourced coverage.
- [ ] Structured source metadata in biography seed data (not just raw text).
- [ ] Paragraph-level source traceability.

Exit criteria: Tier 1 complete and cited, Tier 2 mostly present and reviewable.

## Phase 5: Teachings *(foundation complete, expansion needed)*

Goal: disciplined path for importing koans, verses, dialogues, and teaching excerpts.

- [x] Canonical teaching import shape (`teachings` + `teaching_content` + `RawTeaching`).
- [x] Content classes defined: koan, verse, dialogue (in `teachings.type`).
- [x] Required metadata: author/attribution, collection, case number, locale, translator, edition, license.
- [x] Multi-master roles: `teaching_master_roles` with speaker, commentator, etc.
- [x] Collection structure for koans: collection title, case number, compiler.
- [x] First importer built: Wikisource Mumonkan extractor (`extract-wikisource.ts`).
- [x] 48 Mumonkan cases imported with full metadata and citations.
- [x] 5 standalone teachings imported (Xinxinming, Sandokai, Zazen Wasan, Huike dialogue, Five Ranks).
- [x] UI renders teachings with citations and source metadata on master detail pages.
- [x] Teaching publish gate: `isPublishedTeaching()` requires item-level citation.
- [ ] Use Chan chart `koanRefs` as seed data for linking masters to koan case references.
- [ ] Proverb treatment: define `attribution_status: "traditional"` pipeline for unattributed sayings.
- [ ] Deduplication rules for the same teaching in multiple translations/collections.
- [ ] Distinct UI presentation for koans vs. verses vs. dialogues (currently all rendered the same).
- [ ] Audit coverage by tier and content class.
- [ ] Blue Cliff Record (100 cases) — blocked on Shaw 1961 copyright verification.
- [ ] Book of Serenity / Denkoroku — blocked on finding public domain editions.

Approved sources: Wikisource (public domain), CBETA, SAT Daizokyo, canonical koan collections with acceptable licensing.

Exit criteria: Tier 1 teachings exist where licensable, teachings cited at item level, distinguishable by type.

## Phase 6: Image pipeline *(largely complete)*

Goal: properly attributed media assets.

- [x] Images in `media_assets` with attribution, license, source URL, alt text.
- [x] Item-level citations for media assets (`entity_type = 'media_asset'`).
- [x] App reads from `media_assets` (no hardcoded fallbacks).
- [x] Coverage audit reports DB-backed images.
- [x] 86 masters have cited images (99 asset rows).
- [ ] Add deterministic primary-image selection when multiple images exist per master.
- [ ] Expand image coverage beyond 86 masters via Wikimedia Commons.
- [ ] Store width/height dimensions when available.

Approved sources: Wikimedia Commons, official temple/institution archives with reuse terms.

Exit criteria: `media_assets` is the system of record, no hardcoded fallback dependence.

## Phase 7: Source expansion

Goal: increase coverage diversity without destabilizing reconciliation.

- [ ] Add `Wikidata` for identifiers, alternate names, and structured dates.
- [ ] Add `Wikimedia Commons` metadata ingestion for image candidates.
- [ ] Add one text-oriented source for biography or teaching enrichment.
- [ ] Re-run reconciliation and audit after each new source.
- [ ] `Cosmos Chan` — only after a real extractor and provenance policy exist.

Candidate sources: Wikidata, Wikimedia Commons, CBETA, SAT Daizokyo, BDK English Tripitaka (if licensing confirmed).

Exit criteria: active cited sources increase without introducing suspicious records.

## Phase 8: Lineage graph quality *(major progress)*

Goal: trustworthy transmission edges.

- [x] Core early Chan / Linji / Caodong bridge figures reconnected via editorial overlay.
- [x] Orphan count reduced from 153 → 0.
- [x] Soto lineage extended: Gasan Joseki, Meiho Sotetsu, Kodo Sawaki, Shunryu Suzuki, Deshimaru, Uchiyama, So-on.
- [ ] Add assertions and review-state handling for disputed lineage edges.
- [ ] Ensure every transmission edge has source support.
- [ ] Add audit view for masters whose teacher chain is still incomplete.

Exit criteria: Tier 1 masters connected or explicitly marked unresolved.

## Phase 9: UI and publishing quality

Goal: surface data honestly and clearly.

- [x] Show review/draft status for editorial content.
- [x] Empty states for missing biography, teaching, image coverage.
- [x] Withhold uncited content from public views.
- [x] Cross-school bridge figures preserved in lineage school filter.
- [x] Headline counts dynamic and DB-backed.
- [ ] Show citations inline for biographies, teachings, and images.
- [ ] Group/filter teachings by content class (koans, verses, dialogues).
- [ ] Show collection and case metadata for koans (not just plain text).
- [ ] Ensure school pages and master pages reflect canonical taxonomy consistently.
- [ ] Add smoke checks for key routes after major reseeds.

Exit criteria: UI doesn't imply completeness where data is partial, users can see sources.

## Phase 10: Automation and release hygiene

Goal: pipeline safe to run repeatedly.

- [x] Single script runs full pipeline in order (`npm run pipeline`).
- [x] Unified `npm run seed` seeds everything (sources, masters, schools, transmissions, citations, biographies, teachings).
- [ ] CI or local release checklist that fails on test/build/audit regressions.
- [ ] Post-ingest checklist for updating README and TODO baseline counts.

Exit criteria: full ingestion pass reproducible with one command, regressions fail fast.

---

## Milestones

### Milestone A: Stable foundation *(complete)*

- [x] `hakuin-ekaku` resolved
- [x] provenance bookkeeping in place
- [x] no suspicious slugs
- [x] biography seed runs cleanly
- [x] audit output trustworthy

### Milestone B: Tier 1 encyclopedia *(mostly complete)*

- [x] Tier 1 biographies complete
- [x] First Tier 1 teachings imported (48 Mumonkan + 5 standalone)
- [x] First koans linked with collection and case metadata
- [x] First DB-backed images imported (86 masters)
- [ ] Proverb-like sayings imported with attribution status
- [ ] Tier 1 lineage edges reviewed

### Milestone C: Tier 2 expansion

- [ ] Tier 2 biographies substantially covered
- [ ] Source count increased in controlled way
- [ ] Blue Cliff Record imported (pending copyright)

### Milestone D: Publishable enrichment pipeline

- [x] Hardcoded image fallback dependence removed
- [x] Biographies, teachings, and images all support citations
- [x] Pipeline reproducible and automated
- [ ] CI enforces quality gates
