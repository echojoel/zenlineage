# Transmission Evidence System — Design Spec

**Date:** 2026-05-14
**Status:** Approved for planning
**Scope:** zenlineage.org — `master_transmissions` edges only

## Problem

The public lineage graph on zenlineage.org makes specific claims about who
gave Dharma transmission to whom. In Zen, an incorrect or unsourced
transmission claim is not a small editorial mistake — it can be read as
disrespect for a tradition and the life work of its teachers. Two specific
failure modes we want to make impossible:

1. **Unsourced edges**: a transmission shown on the graph with no
   citable, reputable source backing it.
2. **Bad-source edges**: a transmission "sourced" only by a
   promotional / book-sale / affiliate page, which is functionally
   indistinguishable from no source.

The data is small and static (≈ 568 transmission edges, 522 masters).
Speed of iteration is not the bottleneck. **Defensible evidence is.**

## Goal

Every transmission edge on the public graph carries a quotable,
classified source that the reader can see from the UI, and every claim
we publish can be defended with the exact passage that supports it.
Where evidence is weak, the edge is rendered with visible doubt rather
than hidden, so we are honest about what we do and do not know.

## Non-Goals

- Auto-correcting existing edges. The system is **strictly additive**:
  it produces evidence about existing edges, never rewrites
  `master_transmissions` rows or alters the topological structure of the
  graph.
- Verifying anything other than transmissions. Biographies, dates,
  school assignments, temples, and teachings are validated by the
  existing `audit-accuracy.ts` and `check-exit-criteria.ts` and remain
  out of scope here.
- Blocking deploys. Transmissions are static; the existing
  `audit-transmissions.ts` already errors on structural issues, and that
  remains the only hard gate. This system surfaces provenance, it
  doesn't gate releases.
- Community-correction UI. A public "suggest a correction" flow is
  reserved for v2.

## Trust Model

### Domain classes

A static allow-list in `src/lib/source-domains.ts` maps a domain (or
path prefix) to a `domain_class`. Six classes:

| Class            | What qualifies                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `institutional`  | The tradition's own organisation. Examples: `global.sotozen-net.or.jp`, `whiteplum.org`, `sanboji.org`, `kosenrinzaiji.fr`, `azi.org`, master's school's own lineage register. |
| `academic`       | University presses, JSTOR, recognised academic editions (e.g. Komazawa, Buswell), peer-reviewed journals, Britannica.                                                         |
| `sangha`         | Dharma centres / zendos with verifiable lineage of the master in question on their teacher pages.                                                                             |
| `reference`      | `en.wikipedia.org` *only when it has inline footnotes to the above tiers.* Counts as one source max, regardless of how many language editions cite it.                        |
| `community`      | Personal blogs, recognised practitioners' notes, dharma forums. **Corroborative only — never sole source.**                                                                   |
| `promotional`    | Deny-list. `amazon.*`, `goodreads.com`, `*/buy`, `*/shop`, affiliate paths, Substack/Patreon pay-walls, publisher's marketing pages. Any source matching is a **hard error**. |

Sources whose domain is not in the allow-list are recorded with
`domain_class: unknown`. The audit treats `unknown` like `community`
(corroborative only) and appends an entry to
`scripts/data/source-classification-todo.md` for human classification.

### Trust tiers per edge

| Tier | Rule                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| A    | ≥1 `institutional` source **plus** ≥1 independent corroboration of any class except `promotional`.            |
| B    | ≥2 independent sources, at least one `academic` or `institutional`.                                           |
| C    | Exactly 1 credible source (any class except `promotional`).                                                   |
| D    | No evidence file, no sources, or any source matches the deny-list (in which case the audit also errors).      |

"Independent" means different publisher/host *and* the sources do not
cite each other transitively (best-effort — agents are instructed to
flag obvious dependency in `reducer_notes`).

## Data Model

### Evidence files

One Markdown-with-frontmatter file per edge at:

```
scripts/data/transmission-evidence/<student-slug>__<teacher-slug>.md
```

Filename is derived from the existing `masters.slug` values. Committed
to git so it travels through deploys per the seed-data-is-truth rule.

Schema:

```yaml
---
student: tetsugen-bernard-glassman
teacher: hakuyu-taizan-maezumi
tier: A                          # A | B | C | D
verified_at: 2026-05-14          # ISO date when this file was last revised
sources:
  - publisher: White Plum Asanga
    url: https://whiteplum.org/lineage/...
    domain_class: institutional
    retrieved_on: 2026-05-14
    quote: |
      "Maezumi Roshi gave Dharma transmission (shihō) to Tetsugen
      Bernard Glassman in 1976..."
  - publisher: Sōtōshū kyōmuchō
    url: https://global.sotozen-net.or.jp/...
    domain_class: institutional
    retrieved_on: 2026-05-14
    quote: |
      "..."
reducer_notes: |
  Both sources independently confirm 1976 shihō. No dissent.
human_review_needed: false
---

(Optional free-text reviewer notes below the frontmatter.)
```

Required frontmatter fields: `student`, `teacher`, `tier`, `verified_at`,
`sources` (≥0), `human_review_needed`.
Required per-source fields: `publisher`, `url`, `domain_class`,
`retrieved_on`, `quote` (≥40 chars).

### Database tables

Two new tables, populated by a new seeder and serialised by
`generate-static-data.ts`. Schema goes in `src/db/schema.ts`; a new
migration is added under `drizzle/NNNN_transmission_evidence.sql`.

```sql
CREATE TABLE transmission_evidence (
  id TEXT PRIMARY KEY,
  transmission_id TEXT NOT NULL REFERENCES master_transmissions(id),
  tier TEXT NOT NULL CHECK (tier IN ('A','B','C','D')),
  verified_at TEXT,
  human_review_needed INTEGER NOT NULL DEFAULT 0,
  reducer_notes TEXT,
  reviewer_notes TEXT,
  UNIQUE(transmission_id)
);

CREATE TABLE transmission_sources (
  id TEXT PRIMARY KEY,
  evidence_id TEXT NOT NULL REFERENCES transmission_evidence(id),
  publisher TEXT NOT NULL,
  url TEXT NOT NULL,
  domain_class TEXT NOT NULL,
  retrieved_on TEXT NOT NULL,
  quote TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_transmission_evidence_tier
  ON transmission_evidence(tier);
CREATE INDEX idx_transmission_sources_evidence
  ON transmission_sources(evidence_id);
```

Edges without an evidence file get an inserted row with `tier='D'` and
`human_review_needed=1` so the public-side code never has to handle a
missing-evidence case.

## Components

### 1. `src/lib/source-domains.ts`

Static export of:

```ts
export interface DomainEntry {
  pattern: string;            // domain or domain + path prefix
  class: DomainClass;
  publisher: string;          // human-readable label
  note?: string;
}
export const SOURCE_DOMAINS: DomainEntry[];
export const PROMOTIONAL_DENY: RegExp[];
export function classifyUrl(url: string): {
  class: DomainClass | 'unknown';
  publisher: string | null;
};
```

Seeded with ~40–60 entries: known tradition sites, recognised academic
hosts, the major directories already enumerated in
`memory/reference_european_zen_directories.md`, plus the deny patterns.
Extended over time.

### 2. `src/lib/edge-trust.ts`

Pure functions: parse an evidence file, validate its frontmatter,
compute the tier from its sources per the rules above, return either
`{ok: true, tier, parsed}` or `{ok: false, errors[]}`. The same module
is imported by the seeder, the audit, the generator, and the agent
orchestrator — single source of tier rules.

### 3. `scripts/seed-transmission-evidence.ts`

New prebuild step inserted **after** `audit-transmissions.ts` and
**before** `generate-static-data.ts`. Reads every `.md` file under
`scripts/data/transmission-evidence/`, validates it via
`edge-trust.ts`, and writes `transmission_evidence` +
`transmission_sources`. For any edge without a file, inserts a tier-D
row. Errors hard if a file references a `student`/`teacher` slug pair
that does not resolve to a real edge.

### 4. `scripts/audit-transmissions.ts` extensions

Adds rules:

- `ERROR: evidence-promotional-source` — any source URL matches a
  pattern in `PROMOTIONAL_DENY`.
- `ERROR: evidence-dangling-edge` — an evidence file exists for a
  `student/teacher` pair that has no row in `master_transmissions`.
- `ERROR: evidence-tier-mismatch` — file declares `tier: A` but the
  rules in `edge-trust.ts` compute B from its sources.
- `WARN: evidence-tier-d` — edge resolved to tier D (visible doubt
  expected — informational, not blocking).
- `WARN: evidence-quote-too-short` — any quote field < 40 chars.
- `WARN: evidence-source-unknown-domain` — source has
  `domain_class: unknown`; appends to
  `source-classification-todo.md`.
- `WARN: evidence-stale` — `verified_at` more than 18 months ago.

Dead-URL checks are *opt-in via env flag* (`AUDIT_FETCH_URLS=1`) since
they require network and are slow; emitted as warnings, not errors,
when run.

### 5. `scripts/run-evidence-panel.ts` — agent orchestrator

The reproducible agent recipe. Inputs:

- `--school <slug>` or `--edges <file-of-edge-ids>` or `--tier <X>` —
  selects which edges to process. Default: all tier-D edges, capped at
  the wave size.
- `--wave-size <N>` — default 25.

Behaviour per edge:

1. Spawns **three researcher agents in parallel** using the Agent tool
   with `subagent_type: general-purpose` and
   `isolation: "worktree"` so they cannot see each other's output.
   Each gets:
   - `{student, teacher, dates, school, native_names, existing_notes}`
   - The full `SOURCE_DOMAINS` allow-list with publisher labels.
   - The `PROMOTIONAL_DENY` list.
   - Instructions to return strict JSON:
     ```json
     {
       "sources": [{publisher, url, domain_class, quote, retrieved_on}],
       "confidence": "low|medium|high",
       "dissent_note": "..."
     }
     ```
2. Spawns one **reducer agent** with the three envelopes plus the
   edge's existing `notes` field and any pre-existing citation rows.
   Reducer dedupes sources by canonicalised URL, computes the tier via
   `edge-trust.ts`, sets `human_review_needed: true` if researchers
   contradict on a substantive point (different teacher, different
   year of shihō, etc.), and writes the `.md` file to disk.
3. Spawns one **reviewer agent** with skeptical-reader prompting.
   Reviewer reads the merged file and may:
   - Downgrade the tier.
   - Set `human_review_needed: true`.
   - Append text to `reviewer_notes`.
   - Never upgrade. Never modify `sources`.

State (which edges processed, last-run timestamp, dissent log) is
written to `scripts/data/transmission-evidence/_state.json`.
Suggested corrections from agents (claims that an existing edge is
*wrong*, not just under-sourced) are appended to
`scripts/data/transmission-evidence/_suggested-corrections.md` and
**never auto-applied** — a human merges them by editing the canonical
seed-data files in a normal PR.

### 6. One-time ingestion pass

`scripts/import-existing-citations-to-evidence.ts` runs once. For
every edge that already has a `citations` row with
`entity_type='master_transmission'`, it generates a draft evidence file
seeded with those existing URLs as sources. The tier is *not*
preserved — it's computed from scratch via `edge-trust.ts`, so old
citations only confer the tier their URLs actually justify. The script
sets `human_review_needed: true` on every imported file, so an agent
pass or human review must touch each one before it counts as truly
verified. Removed after the import is committed.

### 7. UI surface

Components live in `src/components/lineage/`.

- Edge style by tier — A: solid 1.5px; B: solid 1px; C: dashed 1px;
  D: dashed 1px + a small `?` glyph at the edge midpoint.
- A side panel "Provenance" section, opened when the user clicks an
  edge, listing each source as
  `{Publisher} — "{quote}" — Retrieved {YYYY-MM-DD} → [link]`.
  Sources are ordered: institutional → academic → sangha → reference →
  community → unknown. This is the **quotable** surface.
- A new public page `/lineage/provenance` enumerates every edge
  grouped by tier, with counts and links to each edge's detail. This
  is the page a sangha auditor uses to sample our work.

Private fields (`reducer_notes`, `reviewer_notes`,
`human_review_needed`) are **not** included in
`generate-static-data.ts` output. They stay in the seed files for
internal review only.

## Pipeline

Final `prebuild` order, with new steps marked **NEW**:

```
seed-db
  ⇒ seed-korean-vietnamese
  ⇒ seed-maezumi-lineage
  ⇒ seed-sanbo-zen-lineage
  ⇒ seed-temples
  ⇒ seed-deshimaru-lineage
  ⇒ seed-shiho-corrections
  ⇒ audit-transmissions                       (extended with evidence rules)
  ⇒ audit-soto-lineage
  ⇒ seed-transmission-evidence                **NEW**
  ⇒ seed-teachings
  ⇒ seed-curated-proverbs
  ⇒ … (rest unchanged) …
  ⇒ generate-static-data                       (joins in evidence + sources)
  ⇒ generate-llms-full
```

`audit-transmissions` runs both before and after `seed-transmission-evidence` is not required — the audit reads the evidence files directly from disk, not the DB. We keep the audit position where it is.

## Backfill Plan

Strict, ordered:

1. **Tier-1 masters first.** All edges where either endpoint is in
   `editorial-tiers.ts#TIER_1`. Currently ~80–120 edges.
2. **Canonical Sōtō spine.** All edges in `canonical-soto-lineage.ts`.
3. **White Plum + Sanbō Zen + Deshimaru lines.** These are the
   contemporary lineages most at risk of misattribution.
4. **Korean / Vietnamese cohorts.**
5. **Remaining historical edges.** Pre-Tang Indian / early Chan.

Each wave: dispatch the agent panel on its slice, commit the resulting
`.md` files and any `_suggested-corrections.md` updates as a single
PR, hand-review the `human_review_needed: true` cases.

## Risks & Mitigations

| Risk                                                             | Mitigation                                                                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Agents fabricate plausible-but-fake sources.                      | Reviewer agent runs after the reducer with explicit instructions to verify each quote actually appears at the URL. Dead-URL audit follows. |
| Researcher agents collude or echo each other.                     | Isolated worktrees, identical prompt + input, agents instructed to return their own envelope without seeing siblings.                       |
| `_suggested-corrections.md` becomes a graveyard.                  | The orchestrator surfaces the count at the end of every wave. Plan tracks it as a backlog metric.                                           |
| Source allow-list drifts away from reality.                       | `source-classification-todo.md` collects every `unknown` domain seen. Reviewed at the end of each wave; allow-list extended by PR.          |
| Tier-D edges get ignored because they "still render."             | `/lineage/provenance` shows tier counts; a tier-D-count budget is added to `check-exit-criteria.ts` once backfill is past Wave 3.          |
| A correctly-attested transmission has only one institutional source and would otherwise be tier C. | Acceptable. The tier ladder bakes in "we don't pretend two when there's one." Visible doubt is the honest answer.                            |

## Open Questions

None blocking. The following are deliberately left for v2:

- Public correction submission flow (Approach C from brainstorming).
- Per-edge detail pages at `/lineage/edge/<id>` (the side panel is
  enough for v1).
- Localised evidence quotes (Japanese / Korean / Vietnamese / Chinese
  source quotes shown in their original script alongside translation).
