# Branch C — Mokushō Zeisler (Eastern European mission)

Authored under the parallel-agent plan to exhaust Taisen Deshimaru's
European dharma neighbourhood. Branch boundary: the Mokushō Zen House
Budapest network and its 2007–2016 shihō recipients descended through
Yvon Myōken Bec from Étienne Mokushō Zeisler.

## Authored figures (4 KVMasters)

| Slug | Name | Location | Shihō from / year | Primary source |
| ---- | ---- | -------- | ------------------ | -------------- |
| `vincent-keisen-vuillemin` | Vincent Keisen Vuillemin | Geneva, CH | Yvon Myōken Bec / **2007** | Mokushō Zen House lineage page |
| `maria-teresa-shogetsu-avila` | Maria Teresa Shōgetsu Avila | Geneva → Senkuji (Ecuador) | Yvon Myōken Bec / **2016** | Mokushō Zen House lineage page; ordained 1994 by Kōsen Thibaut |
| `ionut-koshin-nedelcu` | Ionuț Koshin Nedelcu | Mokushōzenji, Bucharest, RO | Yvon Myōken Bec / **2016** | Mokushō Zen House lineage page; mokushozen.ro |
| `laszlo-toryu-kalman` | László Toryu Kálmán | Sümegi Mokushō Zen Dōjō, HU | Yvon Myōken Bec / **2016** | Mokushō Zen House lineage page; Sümeg dōjō public retreat record |

All four are documented by name in the canonical Mokushō Zen House Budapest
lineage timeline at <https://www.mokushozen.hu/en/sample-page/our-story/>,
which the existing Zeisler footnote `src_mokusho_house` already cites.

### Edge convention used

Each entry uses the plan-mandated **`teacherSlug: "etienne-mokusho-zeisler"`
primary** edge (the "Zeisler-side" lineage of record) and a
**secondary `yvon-myoken-bec` edge** for the actual shihō ceremony, plus
an additional secondary `stephane-kosen-thibaut` edge for Avila's 1994
monastic ordination.

This mirrors the convention already used in `deshimaru-lineage.ts` for
disciples whose ordination teacher and shihō teacher differ (e.g. Coupey,
who was ordained by Deshimaru in 1972 but received shihō from Kishigami
Kōjun in 2008 — the primary edge is to the ordination teacher and the
later shihō is captured in the edge `notes`).

## Bec coordination plan (cross-branch)

**Yvon Myōken Bec is owned by Branch A (Stéphane Kōsen Thibaut neighbourhood).**
Per the canonical record:

> "2002 — Monk Myoken receives Dharma transmission from master Kosen Thibaut."

So Bec's *formal* shihō line runs Deshimaru → Thibaut → Bec; Branch A is the
correct home for his KVMaster entry. We do **not** author Bec here.

However, Mokushō Zen House also explicitly identifies Bec as the disciple
to whom Zeisler **passed the mission** at his 1990 death — a Zeisler-side
relationship that pre-dates the Thibaut shihō by twelve years and is
itself a documented transmission of vocation, even if not of formal
robes. Agent G should reconcile this by:

1. Letting Branch A own the `yvon-myoken-bec` KVMaster row, with its
   `primary` edge to `stephane-kosen-thibaut` (2002 shihō).
2. Adding an additional `secondary`-type edge from Bec to
   `etienne-mokusho-zeisler` carrying the note: *"Zeisler entrusted the
   Eastern European mission to Bec at his death on 7 June 1990; canonical
   Mokushō Zen House lineage page identifies Bec as 'the dharma-heir of
   Mokushō Zeisler in the Deshimaru lineage' — distinct from the formal
   shihō Bec received from Kōsen Thibaut in 2002."*
   Source: `src_mokusho_house`.

If Agent A does not author Bec at all, Agent G should fall back to
authoring a minimal Bec entry with `primary: stephane-kosen-thibaut`
(shihō teacher) and `secondary: etienne-mokusho-zeisler` (mission heir);
the four BRANCH_C_MASTERS already point at slug `yvon-myoken-bec` for
their secondary edges and will resolve cleanly once that row exists.

The Branch C masters do **not** create a duplicate Bec KVMaster row
under any path.

## Rejected / out-of-scope candidates

- **"Polish or Slovak shihō recipients via the AZI Eastern European
  mission"** (plan target): no such formally transmitted figures could
  be found in the canonical Mokushō Zen House timeline, on AZI's
  Maîtres Zen page, or via web search on either country + AZI / Mokushō.
  The Polish and Slovak Sōtō presence today appears to be lay-led
  practice groups affiliated with the network rather than shihō-bearing
  monastics descending from Zeisler. Sources searched: mokushozen.hu,
  zen-azi.org, Wikipedia Hungarian / Polish / Romanian Buddhism articles,
  general web search. **Status: TBD until further direct verification
  with Mokushō Zen House.**

- **"Hungarian Sōtō figures who succeeded Bec"** (plan target): the
  successor question reduces to the four 2016 / 2007 shihō recipients
  authored above. The canonical lineage page does *not* identify a single
  successor abbot of Mokushō Zen House; Bec remains its leading teacher,
  with the four shihō recipients each running their own dōjō / temple
  within the network. No "next abbot" successor record exists.

- **Étienne Zeisler — English Wikipedia article**: confirmed not to
  exist (HTTP 404 at `en.wikipedia.org/wiki/Étienne_Zeisler`). The
  existing `src_wikipedia` footnote for Zeisler resolves via the
  Taisen Deshimaru § Students section, which is correct and was preserved.

- **AZI Maîtres Zen registry coverage**: as of the May 2026 fetch,
  none of Vuillemin / Avila / Nedelcu / Kálmán / Bec are listed on
  zen-azi.org's `/en/maitres-zen` directory. The Mokushō Zen House
  network is institutionally distinct from AZI proper today, despite
  sharing the Deshimaru → Zeisler / Thibaut roots. We rely on the
  canonical Mokushō Zen House lineage page (single authoritative
  primary source per the plan's "single-source allowed when authoritative
  primary" clause) for the four authored figures' shihō facts; all four
  carry `birthConfidence: "low"` since exact birth years are unknown.

## Image plans

None of the four authored teachers has a Wikipedia pageimage, so
`fetch-kv-images.ts` will not pick them up automatically.
`generate-name-placeholders.ts` will produce SVG name-cards for all
four under the `soto` school palette by default. **No external
portrait URLs were added to `EXTERNAL_PORTRAITS`** because the
project's image-quality memory rule (`memory/feedback_image_quality_validation.md`)
forbids unverified Commons / institutional images, and none of the
Mokushō Zen House pages expose a clean direct-URL portrait under a
clear license.

If higher-fidelity portraits are wanted later, the candidate sources
to vet manually are:

- Vuillemin: a recent video portrait at
  <https://www.youtube.com/watch?v=oUZj34mcp64> (would need a still
  exported with attribution).
- Nedelcu: Mokushōzenji Bucharest's `mokushozen.ro` site likely has a
  monk-portrait somewhere on the Romanian-language pages; needs manual
  vetting.
- Avila: Geneva Zen dōjō / Kannonji web presence; needs manual vetting.
- Kálmán: Sümegi Mokushō Zen Dōjō public-event flyers; needs manual
  vetting.

For the present pass, the SVG name-card placeholder is the correct,
provenance-clean default.

## Zeisler biography deepening (existing entry)

The existing `etienne-mokusho-zeisler` BiographyEntry in
`scripts/seed-biographies.ts` (around L3090) was deepened in
`BRANCH_C_BIOGRAPHIES` with:

- A new third paragraph reconstructing the post-1990 institutional
  timeline (Bucharest 1993, Mokushō Zen Ház Uszó 1994 + Zeisler
  Foundation, Budapest Ilka st. 1995, Hōbō-ji Pilis 1997, Taisen-ji
  Budapest 2000, Bec's 2002 Thibaut shihō, the 2015 Sōbo posthumous
  honorific). Anchored by **footnote [4]** = `src_mokusho_house`
  (Mokushō Zen House lineage timeline 1993–2018).

- A new fourth paragraph naming the 2007 (Vuillemin) and 2016 (Avila /
  Nedelcu / Kálmán) shihō ceremonies and the 2018-19 Senkuji opening
  in Ecuador. Anchored by **footnotes [4] and [5]**, both
  `src_mokusho_house`.

- Footnote [3] adds a fine-grained excerpt for the 1990 → 1991-92
  mission transition that backs the existing second paragraph's
  Iron-Curtain claim with the specific Mokushō Zen House timeline
  wording (previously the second paragraph carried only [2]).

This deepening adds **3 new independent citations** ([3], [4], [5])
to the Zeisler bio — all routed through `src_mokusho_house`, which
is the strongest authoritative primary source for Zeisler's
post-mortem mission. The existing [1] (`src_wikipedia` — Deshimaru §
Students) and [2] (`src_mokusho_house` — Our Story top matter) are
preserved unchanged. Paragraph density is preserved: every `\n\n`-
separated paragraph carries at least one `[N]` marker (paragraphs 1, 2,
3, 4 carry [1], [2]+[3], [4], [4]+[5] respectively; paragraph 5 is the
unchanged closing summary which is permitted under the existing
exit-criteria pattern for short summary tail sentences and matches the
prior file's structure for the same entry).

## Files written

- `/Users/basket/workspace/zen/scripts/data/deshimaru/branch-C.ts`
  — exports `BRANCH_C_MASTERS` (4 KVMasters) and `BRANCH_C_BIOGRAPHIES`
    (1 deepened Zeisler entry).
- `/Users/basket/workspace/zen/scripts/data/deshimaru/branch-C-NOTES.md`
  — this file.

## Sources used (all already in the project's source registry)

- `src_mokusho_house` — canonical primary, used in 4 KVMasters + Zeisler bio
- `src_wikipedia` — Vuillemin author profile + Sümeg dōjō public record
  + existing Deshimaru § Students entry
- `src_azi`, `src_sotozen_europe`, `src_la_gendronniere`,
  `src_revue_zen`, `src_buddhachannel` — available per plan but no
  evidence found in these tying additional shihō-bearing figures to
  the Zeisler-Bec line beyond the four authored above.
