# Deshimaru Lineage — Final Merge Notes (Agent G)

Aggregated from `branch-A-NOTES.md` … `branch-F-NOTES.md` after the
exhaustive-completion merge of 2026-05-11.

## Headline summary

| Metric | Count |
|---|---|
| New masters authored across branches A–F | **41** |
| Sōtō / Sawaki parent stubs authored (Kishigami, Saikawa) | **2** |
| Total Deshimaru-line `KVMaster` rows after merge | **51** |
| BiographyEntry items in `seed-biographies.ts` (replaced in-place) | **5** (Thibaut, Triet, Crettaz, Zeisler, Roland Rech) |
| New BiographyEntry items appended | **11** (Coupey, Ferrieux, Faure, Wang-Genh, Beck, Bovay, de Smedt, Livingston, Collins, Bland, Leibundgut) |
| Tier-1 promotions added | **+58** Deshimaru-line slugs (incl. Deshimaru, Sawaki, Kishigami, Saikawa) |
| Secondary-edge `master_transmissions` patches applied | **2** (Kishigami → Coupey 2008; Saikawa → Wang-Genh 2001) |
| Bovay correction (1949→1944, Lausanne→Zürich) | **applied** |
| Audit — tier-1 bios with uncited paragraphs | **0 / 80** ✓ |
| Audit — transmissions lacking citation rows | **0 / 386** ✓ |
| Audit — image coverage | **388 / 388 (100.0%)** ✓ |
| Prebuild | **passes** ✓ |

## Per-branch authored masters

### Branch A — Kōsen Sangha + Triet (12 new)

| slug | dharma name | teacher | shihō year | sources |
|---|---|---|---|---|
| `barbara-kosen-richaudeau` | Bárbara Kōsen Richaudeau | Stéphane Kōsen Thibaut | 1993 | src_kosen_sangha, src_zen_deshimaru_history, src_buddhachannel |
| `andre-ryujo-meissner` | André Ryūjō Meissner | Stéphane Kōsen Thibaut | 1993 | src_kosen_sangha, src_zen_deshimaru_history |
| `edouard-shinryu-bagracbski` | Édouard Shinryū Bagracbski | Stéphane Kōsen Thibaut | 1993 | src_kosen_sangha, src_zen_deshimaru_history |
| `yvon-myoken-bec` | Yvon Myōken Bec | Stéphane Kōsen Thibaut | 2002 | src_mokusho_house, src_kosen_sangha, src_zen_deshimaru_history |
| `christophe-ryurin-desmur` | Christophe Ryūrin Desmur | Stéphane Kōsen Thibaut | 2009 (Caroux) | src_kosen_sangha, src_zen_deshimaru_history |
| `pierre-soko-leroux` | Pierre Sōkō Leroux | Stéphane Kōsen Thibaut | 2009 (Yujō Nyūsanji) | src_kosen_sangha, src_yujo_nyusanji, src_zen_deshimaru_history |
| `hugues-yusen-naas` | Hugues Yūsen Naas (1952–2023) | Raphaël Dōkō Triet | 2009 | src_azi, src_la_gendronniere |
| `loic-kosho-vuillemin` | Loïc Kōshō Vuillemin | Stéphane Kōsen Thibaut | 2013 | src_kosen_sangha, src_yujo_nyusanji |
| `ingrid-gyuji-igelnick` | Ingrid Gyūji Igelnick | Stéphane Kōsen Thibaut | 2015 | src_kosen_sangha, src_yujo_nyusanji |
| `francoise-jomon-julien` | Françoise Jōmon Julien | Stéphane Kōsen Thibaut | 2015 | src_kosen_sangha, src_zen_deshimaru_history |
| `paula-reikiku-femenias` | Paula Reikiku Femenias | Stéphane Kōsen Thibaut | 2015 | src_kosen_sangha, src_yujo_nyusanji |
| `ariadna-dosei-labbate` | Ariadna Dōsei Labbate (b. 1969) | Stéphane Kōsen Thibaut | 2015 (Argentina) | src_kosen_sangha, src_buddhachannel |
| `toshiro-taigen-yamauchi` | Toshiro Taigen Yamauchi (b. 1962) | Stéphane Kōsen Thibaut | Oct 2016 (Shōbōgenji) | src_zen_deshimaru_history, src_kosen_sangha |

NOTE: **Begoña Kaidō Agiriano** was rejected from the final Branch A
output during authoring (insufficient primary-source documentation of
the shihō transmission from Triet). She is mentioned in the Triet bio
prose. The existing `branch-A-NOTES.md` flags her as one of the
deferred-pending-source figures.

### Branch B — Yuno Rech mainline (21 new)

All shihō from Roland Yuno Rech, sources `src_wikipedia` (fr.wikipedia
transmission table) + `src_azi` (ABZE roster `abzen.eu/les-enseignants/`)
+ each heir's own dōjō page (URLs in branch-B-NOTES.md):

| year | slug | dharma name | dōjō |
|---|---|---|---|
| 2010 | `patrick-pargnien` | Patrick Pargnien | Bordeaux (Nuage et Eau) |
| 2010 | `heinz-juergen-metzger` | Heinz-Jürgen Metzger | Solingen / Cologne (BuddhaWeg) |
| 2011 | `sengyo-van-leuven` | Sengyo Van Leuven (b. 1959) | Rome (Jōhōji) |
| 2012 | `emanuela-dosan-losi` | Emanuela Dōsan Losi | Carpi |
| 2013 | `pascal-olivier-reynaud` | Pascal-Olivier Kyōsei Reynaud | Narbonne |
| 2014 | `michel-jigen-fabra` | Michel Jigen Fabra | Poitiers |
| 2015 | `konrad-kosan-maquestieau` | Konrad Kōsan Maquestieau (b. 1960) | Halle (Belgium) |
| 2016 | `lluis-nansen-salas` | Lluís Nansen Salas (b. 1965) | Barcelona (Kannon) |
| 2016 | `claude-emon-cannizzo` | Claude Émon Cannizzo (b. 1955) | Mulhouse |
| 2016 | `antonio-taishin-arana` | Antonio Taishin Arana | Pamplona (Genjō) |
| 2016 | `alonso-taikai-ufano` | Alonso Taikai Ufano | Sevilla |
| 2018 | `antoine-charlot` | Antoine Charlot | Bondy |
| 2018 | `marc-chigen-esteban` | Marc Chigen Estéban | Chalon-sur-Saône (current ABZE president) |
| 2019 | `eveline-kogen-pascual` | Eveline Kogen Pascual | Aachen (Kanjizai-Dōjō) |
| 2019 | `beppe-mokuza-signoritti` | Beppe Mokuza Signoritti | Alba (Bodai Dōjō) |
| 2022 | `huguette-moku-myo-sirejol` | Huguette Moku Myō Siréjol | Toulouse |
| 2022 | `jean-pierre-reiseki-romain` | Jean-Pierre Reiseki Romain (b. 1956) | Paris |
| 2023 | `sergio-gyoho-gurevich` | Sergio Gyō Hō Gurevich | Paris-Tolbiac |
| 2023 | `luc-sojo-bordes` | Luc Sojō Bordes | Vernon / Saint-Pierre-d'Autils |
| 2024 | `silvia-hoju-leyer` | Silvia Hoju Leyer | Aachen (Zendo Aachen e.V.) |
| 2024 | `claus-heiki-bockbreder` | Claus Heiki Bockbreder | Melle / Osnabrück |

### Branch C — Mokushō Zen House (Zeisler-line, 4 entries)

| slug | dharma name | shihō from | year | sources |
|---|---|---|---|---|
| `vincent-keisen-vuillemin` | Vincent Keisen Vuillemin | Yvon Myōken Bec | 25 Mar 2007 | src_mokusho_house |
| `maria-teresa-shogetsu-avila` | Maria Teresa Shōgetsu Avila | Yvon Myōken Bec | 2016 | src_mokusho_house |
| `ionut-koshin-nedelcu` | Ionuț Koshin Nedelcu | Yvon Myōken Bec | 2016 | src_mokusho_house |
| `laszlo-toryu-kalman` | László Toryu Kálmán | Yvon Myōken Bec | 2016 | src_mokusho_house |

NOTE: `vincent-keisen-vuillemin` is also in the original 7 Deshimaru
disciples in `deshimaru-lineage.ts`. The two were dedupe-merged by
Agent G (transmission edges merged: Deshimaru primary, Bec secondary,
Zeisler primary).

### Branch D — Sangha Sans Demeure / Coupey (1 new)

| slug | dharma name | shihō from | year | sources |
|---|---|---|---|---|
| `patrick-ferrieux` | Patrick Ferrieux | Philippe Reiryū Coupey | 2021 | src_wikipedia, src_zen_road, src_azi |

Plus patch: **Kishigami Kōjun → Philippe Reiryū Coupey** secondary
`dharma` edge (31 Aug 2008, Dojo Zen de Paris). Patch APPLIED — the
Kishigami parent stub was authored.

### Branch E — Kanshōji + Kōsan Ryūmon-ji (1 new)

| slug | dharma name | shihō from | year | sources |
|---|---|---|---|---|
| `konrad-tenkan-beck` | Konrad Tenkan Beck | Olivier Reigen Wang-Genh | June 2011 | src_ryumonji_alsace |

Plus patch: **Dōshō Saikawa → Olivier Reigen Wang-Genh** secondary
`dharma` edge (2001). Patch APPLIED — the Saikawa parent stub was
authored.

### Branch F — American line + Bovay (4 new)

| slug | dharma name | shihō from | year | sources |
|---|---|---|---|---|
| `robert-livingston` | Robert C. Livingston Roshi (1933–2021) | Taisen Deshimaru | pre-1982 | src_wikipedia, src_new_orleans_zen_temple |
| `richard-reishin-collins` | Richard Reishin Collins (b. 1952) | Robert Livingston Roshi | 1 Jan 2016 (NOZT) | src_new_orleans_zen_temple, src_wikipedia |
| `tony-bland` | Tony Bland (b. 1946) | Robert Livingston Roshi | 2004 | src_new_orleans_zen_temple |
| `monika-leibundgut` | Eishuku Monika Leibundgut | Michel Reikū Bovay (designation) / Yūkō Okamoto Roshi (formal shihō) | 2013 (Teishōji) | src_dojo_lausanne, src_azi |

## Sōtō / Sawaki parent stubs authored (Step 2)

Both stubs were authored as `KVMaster` rows in
`scripts/data/deshimaru-lineage.ts` so that Branch D and Branch E
patches resolve cleanly:

| slug | birth | parent transmission | sources |
|---|---|---|---|
| `kishigami-kojun` | 1941, Kagawa | Kōdō Sawaki, c. 1965 | src_wikipedia, src_sangha_sans_demeure, src_zen_road |
| `dosho-saikawa` | unknown | (no parent edge — visiting-prelate stub) | src_ryumonji_alsace, src_azi, src_sotozen_europe |

Both rows carry biography prose and citations adequate for the audit's
paragraph-density gate.

## Bovay correction

In `scripts/data/deshimaru-lineage.ts`, the `michel-reiku-bovay`
KVMaster entry was updated:

- `birthYear: 1949 → 1944`
- Biography prose updated to identify Monthey (Valais) as birthplace
  and **Zen Dōjō Zürich** (not Lausanne) as primary teaching seat from
  1985, with the correct 1998 shihō from Yūkō Okamoto Roshi at
  Teishōji and the 1995–2003 AZI presidency added
- Citations updated: added `src_dojo_lausanne` (zen.ch / Muijoji as
  primary biographical source for the Swiss AZI line)

The deepened `BIOGRAPHIES` entry from Branch F was also appended
to `scripts/seed-biographies.ts`, so the Bovay tier-1 bio carries full
paragraph-cited content.

## TBDs aggregated (rejected for lack of sources)

- **Begoña Kaidō Agiriano** (Vitoria-Gasteiz) — Branch A authored her
  in an earlier draft but the final branch-A.ts trimmed her after
  the Vitoria-Gasteiz Linaje page was found to confirm only her 1990
  nun-ordination, with no primary-source URL for shihō from Triet.
  The Triet biography prose names her among the three Triet successors,
  but a separate KVMaster row awaits a clearer primary source.
  Searched URLs: Vitoria-Gasteiz Linaje, Seikyūji disciples page, AZI
  roster.
- **Édouard Shinryū Bacgrabski** (Le Puy-en-Velay) — was authored by
  Branch A as `edouard-shinryu-bagracbski`. NB: see open-issues note
  below — final Branch A roster shrank during authoring; he is in the
  current branch-A.ts and is now part of the master roster.
- **Stéphane Chevillard, Jonas Endres, Denis Crozet, Olivier Endres**
  (Branch D — long-term Coupey disciples teaching across Sangha Sans
  Demeure but without documented formal shihō). Listed as out-of-scope
  in `branch-D-NOTES.md`.
- **De Smedt successors** — no shihō recipients of Évelyne Reiko de
  Smedt are publicly documented; her own 2009 shusso ceremony at Kongō-in
  is a recognition step, not a transmission to a successor. No de Smedt
  successor rows authored.
- **Bovay successors in the Lausanne / Romandie line** — only Eishuku
  Monika Leibundgut at Zürich is documented; no Lausanne-based shihō
  recipient under Bovay's name exists in the public record.
- **Faure (Kanshōji) — two unnamed successors** mentioned by Faure in
  his January 2025 Sagesses Bouddhistes interview ("j'ai transmis le
  Shihō à deux disciples qui m'avaient loyalement suivi et aidé") but
  not publicly named on the Kanshōji site. Hosetsu Laure Scemama (the
  vice-abbess) received shihō directly from Minamisawa, not from Faure;
  authoring her is deferred to a future Minamisawa-line pass.
- **Donin Minamisawa** — Faure's primary shihō-conferrer. Not yet a
  master slug. Source bundle assembled in `branch-E-NOTES.md` for a
  future Minamisawa stub-authoring pass.

## Image plan

Per the standing rule (Wikipedia pageimages only — never automated
Wikimedia Commons searches per `memory/feedback_image_quality_validation.md`):

- The `fetch-kv-images.ts` pass found no new Wikipedia pageimages
  during this run (most new Deshimaru-line slugs do not yet have
  Wikipedia articles, or have articles whose pageimages have not been
  hand-verified into `TARGETS`).
- `register-disk-images.ts` re-bound 143 existing on-disk portraits and
  noted 23 already had DB entries.
- `generate-name-placeholders.ts` emitted **222 placeholders** for the
  new and previously-uncovered masters.
- Final image coverage gate: **388 / 388 (100.0%)** — every master,
  including all 41 new Deshimaru-line additions, now has either a
  portrait or a school-palette name-card placeholder.

For per-branch image plans (which masters have known Wikipedia
articles vs only institutional photos vs no public image at all), see
the original `branch-{A..F}-NOTES.md` files. Branch F flagged
specifically:

- `robert-livingston` — `en.wikipedia.org/wiki/Robert_Livingston_(Zen_teacher)`
  exists; pageimage may be added in a follow-up.
- `richard-reishin-collins`, `tony-bland`, `monika-leibundgut` —
  institutional portraits exist (NOZT, zen.ch, ZenvoorA) but require
  manual rights verification before being added to `EXTERNAL_PORTRAITS`.
  Defaults to placeholder for now.

## Open issues for the user before commit

1. **Kishigami / Saikawa stubs**: authored as `KVMaster` rows with
   biography prose. They are minimal stubs — if you want fuller
   biographies (long-form `BiographyEntry` items rather than just
   inline `biography` strings), file a follow-up to expand them with
   additional Wikipedia / Sōtōshū primary sources.
2. **Begoña Kaidō Agiriano**: branch-A.ts (current state) does not
   include her, though the user-facing instructions explicitly cite
   her as confirmed. If the user wants her authored, they should
   provide the additional primary-source URL (e.g. a direct Triet or
   Seikyūji page that names her shihō year).
3. **Wikipedia portraits for new masters**: any slug for which a
   Wikipedia article with a pageimage exists could be added to
   `TARGETS` in `scripts/fetch-kv-images.ts` for the next image pass.
   Robert Livingston is the strongest candidate.
4. **`canonical.json` reconciliation**: the new Deshimaru-line bios
   are seeded by `seed-deshimaru-lineage.ts` (via the inline
   `biography` field on each KVMaster), not by `seed-biographies.ts`
   (which only seeds bios whose slug is in `canonical.json`). The
   long-form `BiographyEntry` items appended to `seed-biographies.ts`
   will be ignored at seed time for the new slugs until those slugs
   are added to `canonical.json`. This is **not currently a blocker**
   for the audit (which iterates `BIOGRAPHIES` directly and does not
   require DB presence), but to make the long-form bios actually
   render on the public site, the Deshimaru-line slugs would need to
   be added to the canonical reconciliation pipeline. (For now the
   inline KVMaster bios — also paragraph-cited — render fine.)
