# Branch D — Sangha Sans Demeure / Zen Road (Coupey branch) — research notes

Owner: Agent D. Compiled 2026-05-11 from public sources (no private
correspondence). Scope: formal shihō recipients of Philippe Reiryū
Coupey (b. 8 December 1937, New York City).

## Authored figures

### Promoted to `BRANCH_D_MASTERS`

- **Patrick Ferrieux** — French Sōtō Zen monk. Met Coupey at the Dojo
  Zen de Paris in 1995, ordained as a monk by Coupey in 2000, received
  shihō from Coupey in **2021**. Engineer / quality-management
  consultant by profession. Serves on the conseil d'administration of
  the Dojo Zen de Paris and AZI; runs Daruma-Boutique Zen; teaches at
  the Gendronnière. Sources: Dojo Zen de Paris "Qui sommes-nous" page;
  Zen Road flyer (Patrick Ferrieux, 12-6-22.pdf); Dojo zen de Nantes
  announcement of his journée du 12 avril 2026. Birth year **TBD** —
  not published on his sangha pages, in the AZI registry, or on his
  Academia / Viadeo profiles. Marked `birthPrecision: "unknown"`,
  `birthConfidence: "low"` in `branch-D.ts`.

### Deepened `BiographyEntry` for `philippe-reiryu-coupey`

A long-form (~700 word) `BiographyEntry` with paragraph-level citation
density (every `\n\n`-separated paragraph carries at least one `[N]`
marker resolving to the `footnotes[]` array) is included in
`BRANCH_D_BIOGRAPHIES`. Agent G should drop this directly into
`scripts/seed-biographies.ts`'s `BIOGRAPHIES[]`. The shorter inline
`biography` string already present on the `philippe-reiryu-coupey`
KVMaster entry inside `scripts/data/deshimaru-lineage.ts` may stay
as-is — both renderers cite the same underlying sources.

## Rejected / out-of-scope candidates

The following figures lead Sangha Sans Demeure / Zen Road dōjōs and
train under Coupey, but **do not yet hold formal shihō from him** as
of May 2026 and are therefore out of scope for this branch.

- **Stéphane Chevillard** — practitioner since 2004 in Bordeaux,
  joined Coupey in Paris in 2010; runs the Wednesday-noon zazen at
  Dojo Zen de Paris; co-author with Coupey, Deshimaru and Jonas Endres
  of *Vrai zen: source vive & révolution intérieure* (2021). Listed
  on the Dojo Zen de Paris teachers roster as "training under Coupey"
  rather than as a shihō recipient.
- **Jonas Endres** — German practitioner; met Coupey in Hamburg,
  moved to Paris in 2005 to follow him, became Coupey's assistant in
  2010; opened the Dojo Île de la Cité in 2021; directs L'Originel-
  Antoni publications. No public record of shihō; appears on the
  Sangha Sans Demeure dōjō list as the leader of Île de la Cité,
  but the Dojo Zen de Paris teachers roster does not list a date of
  transmission for him (in contrast to the explicit "2021" given for
  Ferrieux).
- **Denis Crozet, Guillaume Faravel, Françoise Lesage, Michael Weill,
  André Huet, Valérie Dedieu, Philippe Saux-Picard, Nathalie le
  Guillanton, Pascale Laroussi, Yves Jégou, Paul Pichaureau, François
  Lang, Blanche Heugel, Christian Espiau, Diane Liorel, Bruno Mille,
  Alain Triballeau, Eric Arabucki, Bruno Peslerbe, René Lelong**
  (France); **Gerd Fuchs, Hermann Jansen, Torben Fröhlich, Lucius
  Bobikiewicz, Gernot Knödler, Bertrand Schütz, Frank Tatas, Christoph
  Martin, Jürgen Mattik, Uli Dietze, Grit Nagel** (Germany);
  **Gerhard Reuteler** (Switzerland) — published as dōjō or group
  leaders in the Zen Road directory. None is publicly identified as
  a shihō recipient of Coupey. They are *responsables de dōjō* /
  *responsables de groupe*, which in the AZI / Sangha Sans Demeure
  organisational vocabulary does not imply dharma transmission.
- **Patrick Coupey** Sangha Sans Demeure community-organising team
  members (Geneviève Coupey-Reineke, etc.) — no shihō on the public
  record; family / volunteer roles only.

If Agent G later confirms shihō for any of these via a primary source
(Sangha Sans Demeure newsletter, AZI council minutes, etc.) they can
be added to `BRANCH_D_MASTERS` in a follow-up; for now they remain
disciples / responsables, not authored masters.

## Bec coordination (cross-branch)

Branch D was asked to verify whether **Yvon Myōken Bec** (b. 1949,
France; founder of Mokushō Zen House, Hungary / Romania) received his
shihō via Coupey, Kōsen, or Zeisler — Agent A owns the Bec master
entry.

Public record (mokushozen.hu, zen-deshimaru.com / ABZD, terebess.hu,
The Zen Universe podcast): **Bec's shihō came from Stéphane Kōsen
Thibaut in autumn 2002, given in the name of Bec's deceased fellow
disciple Étienne Mokushō Zeisler** (who had given Bec the mission to
open a Budapest dōjō shortly before Zeisler's 1990 death). It is
therefore neither a Coupey edge nor an independent Zeisler edge —
formally it belongs in Agent E's territory (Kōsen Thibaut branch).
Agent A should record the Bec transmission as `teacherSlug:
"stephane-kosen-thibaut"`, `type: "dharma"`, with the historical note
that the shihō was conferred *in the name of Étienne Mokushō Zeisler*
to honour Bec's Eastern-European mission.

## Kishigami slug verification

Verified by `grep -ri "kishigami" scripts/ src/ --include="*.ts"`:
the only files mentioning "kishigami" are `scripts/seed-biographies.ts`
(prose only, no master row) and `scripts/data/deshimaru-lineage.ts`
(Coupey biography prose only). **No `kishigami-kojun` master slug is
defined anywhere in the repo.**

Implication for `BRANCH_D_MASTER_PATCHES`: the patch
`{ slug: "philippe-reiryu-coupey", addTransmissions: [{ teacherSlug:
"kishigami-kojun", … }] }` will produce a dangling edge unless one of
the following happens *before* the next reseed:

1. **Preferred** — Agent G (or whichever branch owns the Sōtō / Sawaki
   parent figures) authors **Kishigami Kōjun** as a `KVMaster`:
   - `slug: "kishigami-kojun"`
   - `schoolSlug: "soto"` (or whatever school slug the Sōtō school
     uses in `src/lib/school-taxonomy.ts`)
   - `birthYear: 1941`, `birthPrecision: "exact"`,
     `birthConfidence: "high"`, `deathYear: null`
   - Parent transmission: `teacherSlug: "kodo-sawaki"`, `type: "dharma"`,
     received c. July 1965 (one month before Sawaki's death in
     December 1965 — verify the exact month against fr.wikipedia
     "Kishigami Kojun"), `isPrimary: true`
   - Sources: `src_wikipedia`, `src_sangha_sans_demeure`
2. **Alternative** — the seeder treats the Kishigami → Coupey edge as
   tolerated-but-orphan and surfaces it in the audit; the
   `dharma`-type edge does not need to participate in the topological
   root reachability check, since Coupey is already reached through
   the Deshimaru ordination edge.

Either way the patch in `branch-D.ts` records the historical fact
correctly; the resolution is an organisational choice for Agent G.

## Image plans

- **Patrick Ferrieux** — no Wikipedia article, no Wikimedia Commons
  image. The Zen Road flyer (PatrickFerrieuxflyer12-6-22.pdf) and the
  Flickr group "Zazen avec Patrick Ferrieux" both contain photographs,
  but they are user-uploaded with no clear license. Default plan:
  let `generate-name-placeholders.ts` emit a Sōtō-palette name-card
  placeholder. Do **not** auto-fetch from Flickr or the Zen Road site.
- **Philippe Reiryū Coupey** — already covered by the existing image
  pipeline (existing `media_assets` row should be retained). If the
  current asset is a placeholder, a Buddhachannel or Sangha Sans
  Demeure portrait can be added to `EXTERNAL_PORTRAITS` only after
  manual license / attribution check, per
  `memory/feedback_image_quality_validation.md`.

## Source IDs used

Confirmed present in `scripts/seed-sources.ts` (verified via grep):
- `src_zen_road` (line 560)
- `src_la_gendronniere` (line 744)
- `src_sangha_sans_demeure` (line 780)
- `src_revue_zen` (line 789)
- `src_buddhachannel` (line 798)

Plus the long-standing `src_wikipedia`, `src_azi`, and
`src_sotozen_europe` already used by `deshimaru-lineage.ts`.

## TBD / open questions

- Patrick Ferrieux birth year (not published).
- Whether Stéphane Chevillard or Jonas Endres has received an as-yet-
  unannounced shihō from Coupey post-2024 — recheck Sangha Sans
  Demeure / Dojo Zen de Paris rosters before next major reseed.
- Whether Coupey has given shihō to any German or Swiss disciple
  outside the Dojo Zen de Paris orbit (none found in May 2026 web
  search; Berlin / Hamburg / Buchs leaders are *responsables*, not
  shihō holders, on the public record).
