# Lineage Boundary: Generational Cutoff + Archive

**Date:** 2026-06-29
**Status:** Design — awaiting review
**Topic:** Scope the public lineage to the founding generation; archive (not delete) everyone below.

## Rationale

An ancestral lineage chart is, by tradition, a record of *ancestors*. The `/lineage` graph
currently extends past that into the living, contemporary generation — ~33 living teachers
plus the full modern successor layer. Scoping the public chart to the founding generation
makes it tighter, more consistent, and truer to what a lineage chart is for:

1. **Editorial scope.** The atlas documents the historical transmission up to the teachers
   who established each tradition in the West. Their successors carry a *living* tradition
   that is still unfolding and is not what an ancestral chart records.
2. **Consistency.** A single, mechanical boundary (founders + their ancestors) is far more
   consistent than an ever-growing frontier of contemporary teachers with uneven coverage.
3. **Respect.** Placing living teachers among the historical patriarchs reads as canonizing
   them; and asserting contested present-day heir/transmission claims is not something the
   atlas should adjudicate. Both are avoided by ending at the founders.

Nothing is lost: everyone below the line is **archived, not deleted** (see below).

> **Framing note for implementers:** keep the rationale editorial in all copy and commit
> messages — scope, tradition, and consistency (e.g. "scope the lineage to the founding
> generation", "lineage publication boundary"). The public and repo-facing story is simply
> that the atlas charts the ancestral lineage up to the founding generation.

## Decision summary

- **Boundary:** generational line. Terminate at an authored set of founders; everyone
  strictly below is excluded from the public site.
- **Living masters:** never published, regardless of position in the graph (absolute).
- **Excluded masters:** fully removed from the public site (no graph node, no detail page)
  — but **archived, never deleted.** Authored records stay in the repo and are still seeded
  into the ephemeral DB; they are simply not *published*.
- **Founder set:** **9 founders** (see below) — the émigré pioneer generation.
- **Temples:** stay as institutions; links to archived master pages removed; no living-teacher
  bios rendered.
- **Archive form:** the version-controlled seed files + the `living`/`published` flags are
  the archive. No separate export artifact.

## The rule (one predicate)

```
published(m)  ⇔  (m.living == false)
              AND NOT ( m is a strict descendant of FOUNDERS  AND  m ∉ FOUNDERS )
```

Equivalently: `archived = living ∪ ( descendants(FOUNDERS) \ FOUNDERS )`, where
`descendants` follows transmission edges (`teacher_id → student_id`).

Two clauses, both load-bearing:

- **`living` is absolute.** No living master is ever published, even one that hangs off an
  older ancestor rather than below a designated founder (see "living off older ancestors").
  This is the field that enforces the no-living-masters policy.
- **Founders are always published.** A founder that happens to sit below another founder via
  some edge stays published. Real case: `taizan-maezumi` has a *secondary* transmission edge
  from `yamada-koun`, so he is technically a descendant of a founder — the `m ∉ FOUNDERS`
  exception keeps him published.

### Verified properties (against current `zen.db`)

- **Single root preserved** — everything published is reachable from `shakyamuni-buddha`.
- **No orphans.** The only two deceased students of living teachers both have a deceased
  fallback teacher, so pruning the living parent does not disconnect them:
  `hugues-yusen-naas` → `taisen-deshimaru` (d. 1982); `sojun-mel-weitsman` →
  `shunryu-suzuki` (d. 1971).
- **Historical completeness preserved.** A deceased master who is *not* below any founder
  stays published — we end the modern bottom, not historical side-branches.
- **Impact (9-founder set):** **349 published / 90 archived** of 439 masters currently
  reachable from the root (~20% scoped out, all in the modern successor layer).

## `FOUNDERS` — the editorial artifact (decided)

A new authored module `src/lib/lineage-boundary.ts` declares the founders, each with a
one-line rationale and a source id. **Criterion:** a founder is a *deceased émigré pioneer
who personally established their tradition in the West.* Their Western-trained successors,
and the homeland successors who led the Asian organizations, are archived.

| Founder | d. | Branch / rationale |
|---|---|---|
| `taisen-deshimaru` | 1982 | Sōtō → Europe (AZI) |
| `shunryu-suzuki` | 1971 | Sōtō → America (San Francisco Zen Center) |
| `taizan-maezumi` | 1995 | White Plum Asaṅga → America |
| `dainin-katagiri` | 1990 | Sōtō → America (Minnesota Zen Meditation Center) |
| `kobun-chino-otogawa` | 2002 | Sōtō → America (Jikoji / Hokoji) |
| `yamada-koun` | 1989 | Sanbō Kyōdan koan Zen → West |
| `seung-sahn` | 2004 | Korean Sŏn (Kwan Um) → West |
| `thich-nhat-hanh` | 2022 | Vietnamese Thiền (Plum Village) → Europe/West |
| `thich-thien-hoa` | 1973 | Vietnamese (separate line; teacher of living `thich-thanh-tu`) |

The data only *proposes* candidates (deceased masters with living/successor descendants); a
human authored this final set. `roland-rech` (d. 2024), `stephane-kosen-thibaut` (d. 2025),
`robert-livingston` (d. 2021) and `etienne-mokusho-zeisler` (d. 1990) surface as
"deceased-with-living-students" but are *inside Deshimaru's subtree* — archived successors,
not founders.

Notable deceased successors that the line **archives** (preserved in the archive; surfaceable
later if ever desired): `robert-aitken`, `bernie-tetsugen-glassman`, `john-daido-loori`,
`charlotte-joko-beck`, `willigis-jager`, `hugo-enomiya-lassalle`, `kubota-jiun`,
`sojun-mel-weitsman`. Full list in Appendix B.

### Living off older ancestors (handled by the `living` clause, not by founders)

Five living masters branch directly off *older deceased* masters rather than below a
designated founder. They are archived by the `living` clause; their deceased teachers stay
published as historical side-branches:

| Living (archived) | Deceased teacher (stays published) |
|---|---|
| `kishigami-kojun` (b. 1941) | `kodo-sawaki` (d. 1965) |
| `shohaku-okumura` (b. 1948) → `ivan-densho-quintero` (b. 1961) | `kosho-uchiyama` (d. 1998) |
| `moriyama-daigyo` (b. 1938) | `niwa-rempo-zenji` (d. 1993) |
| `brad-warner` (b. 1964) | `gudo-wafu-nishijima` (d. 2014) |

## Data model changes

- **`schema.ts`** — add two columns to `masters`:
  - `living` (boolean, authored) — enforces the no-living-masters policy.
  - `published` (boolean, **derived** at build time).
- **Migration** — new `drizzle/NNNN_lineage_boundary.sql` adding both columns, plus an
  idempotent `ADD COLUMN IF NOT EXISTS`-style fallback in the seeder (per the
  `seed-temples.ts#ensureTempleSchema` pattern) so a fresh DB tolerates a build without
  `drizzle-kit migrate`.
- **`living` authoring** — set `living=true` for the 33 candidates (death_year null, born
  ≥ 1920; full list in Appendix A). **Spot-check each**: the `death_year IS NULL` heuristic
  is imperfect — confirm none have actually died (if so, add the death year; they become
  published only if not below a founder). The authored `living` flag, not the heuristic, is
  the gate.
- **`src/lib/lineage-boundary.ts`** (new) — the `FOUNDERS` array (slug + rationale + sourceId)
  and the documented boundary predicate. Single reviewable place for the editorial policy.

## Build / publish pipeline

- **New step** `scripts/compute-lineage-boundary.ts`, run in `prebuild` *after* seeding and
  *before* `generate-static-data`: traverse transmissions from `FOUNDERS`, apply the
  predicate (living clause + founder exception), write `published` on every master.
- **Public surfaces filter `published=true`:**
  - `/lineage` graph nodes *and* edges (an edge into an archived node is dropped).
  - `/masters` list and master-detail `generateStaticParams` (archived → `notFound()`).
  - `sitemap`, `opengraph-image`, `generate-static-data`, `generate-llms-full`.

## Archive (retention, not deletion)

- Authored seed records for archived masters **remain in the seed files** — the durable,
  version-controlled archive — and are still seeded into the ephemeral DB. They are simply
  never published.
- Recovery is a one-line change: flip `living`, or add/remove a `FOUNDERS` entry.
- No separate export artifact (the seed files + flags are the archive).

## Audit / validation re-scope

`check-exit-criteria.ts`, `validate-graph.ts`, and `dag-validation.ts` scope their checks
(orphans, image coverage, citation coverage, single-root) to `published=true`. Archived
masters must not register as missing-image / uncited / orphan failures. The single-root +
no-orphan invariants are asserted over the published subgraph.

## Temples / `/practice`

Temples are *institutions* and stay. Handling:

- Drop links from temple records to now-archived master detail pages.
- Do not render living individuals' biographies; a factual affiliation line is fine.
- **Implementation task:** audit whether temple/practice data references master slugs and
  where those are rendered.

## Editorial note (on `/lineage` and `/about`)

> *This atlas charts the ancestral lineage up to the teachers who carried these traditions
> out of Asia. Their living successors continue a living tradition we do not attempt to
> chart here.*

## Non-goals

- No public "living teachers directory."
- No deletion of authored data.
- No change to any master's recorded dates except correcting genuine errors found during
  the `living` spot-check.

## Risks

- The `death_year IS NULL` + `born ≥ 1920` heuristic for `living` is imperfect in both
  directions; the **authored** flag is the real gate, and each candidate must be spot-checked.

---

## Appendix A — `living=true` candidates (33)

`thich-thanh-tu` (1924), `jakusho-kwong` (1935), `richard-zentatsu-baker` (1936),
`philippe-reiryu-coupey` (1937), `moriyama-daigyo` (1938), `hoitsu-suzuki` (1939),
`yamada-ryoun` (1940), `kishigami-kojun` (1941), `gerry-shishin-wick` (1943),
`reb-anderson` (1943), `dennis-genpo-merzel` (1944), `jan-chozen-bays` (1945),
`yves-shoshin-crettaz` (1946), `tony-bland` (1946), `ruben-habito` (1947),
`shohaku-okumura` (1948), `migaku-sato` (1948), `jean-pierre-genshu-faure` (1948),
`yvon-myoken-bec` (1949), `raphael-doko-triet` (1950), `barbara-kosen-richaudeau` (1951),
`richard-reishin-collins` (1952), `olivier-reigen-wang-genh` (1955),
`claude-emon-cannizzo` (1955), `jean-pierre-reiseki-romain` (1956),
`sengyo-van-leuven` (1959), `konrad-kosan-maquestieau` (1960),
`ivan-densho-quintero` (1961), `henry-shukman` (1962), `toshiro-taigen-yamauchi` (1962),
`brad-warner` (1964), `lluis-nansen-salas` (1965), `ariadna-dosei-labbate` (1969).

## Appendix B — dated deceased successors archived under the 9-founder set (15)

These are the archived descendants that carry a death year (the headline 90-archived total
also includes descendants with no recorded death date plus the 33 living):

`stephane-kosen-thibaut` (2025), `roland-rech` (2024), `hugues-yusen-naas` (2023),
`kubota-jiun` (2023), `robert-livingston` (2021), `sojun-mel-weitsman` (2021),
`susan-myoyu-andersen` (2020), `willigis-jager` (2020), `bernie-tetsugen-glassman` (2018),
`charlotte-joko-beck` (2011), `robert-aitken` (2010), `john-daido-loori` (2009),
`michel-reiku-bovay` (2009), `etienne-mokusho-zeisler` (1990), `hugo-enomiya-lassalle` (1990).
