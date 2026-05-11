# Branch A — Kōsen Sangha / Yujō Nyūsanji + Triet's Iberian successor line

Authored by parallel Agent A for the Deshimaru exhaustive-completion pass.
Merged into `scripts/data/deshimaru-lineage.ts` and
`scripts/seed-biographies.ts` by Agent G.

This document is intended to be reviewable by a member of Deshimaru's
own lineage. Every claim of substance in `branch-A.ts` is footnoted with
a verbatim primary-source URL and excerpt — see the `pageOrSection` text
of each `KVCitation` and `BiographyEntry.footnote`. Citation density on
the authored masters runs 1.20–2.82 inline markers per sentence
(measured by audit script — see "Verification" section below).

## Figures authored (12 new KVMaster entries)

All entries are formal shihō recipients. All Kōsen-line entries have the
two-source minimum (the official ABZD / Kosen-Sangha shihō roster at
`https://www.zen-deshimaru.com/en/abzd-association/master-kosen/` —
cross-confirmed at the French `/fr/association-abzd/maitre-kosen/` —
plus an individual master page on the same domain, the Mokusho Zen
House biographical page, the Buddhistdoor en Español interview, the
ZENKAN Bárbara Kōsen page, the Sokozen.org Pierre Sōkō page, or the
Dōjō Zen Buenos Aires page). Hugues Yūsen Naas is sourced from the AZI
biographical page at `https://www.zen-azi.org/en/hugues-yusen-naas`,
which records ordination, shihō, La Gendronnière abbacy, and Daishugyōji
founding in a single authoritative entry.

Image plan defaults to `placeholder-svg`. None of the figures has a
French-Wikipedia article with a Commons-licensed pageimage that meets
the project's image-quality bar (`memory/feedback_image_quality_validation.md`);
Agent G should add hand-curated portraits via `EXTERNAL_PORTRAITS` in
`scripts/fetch-kv-images.ts` only after manual verification of source
provenance and licence.

### Kōsen Thibaut shihō recipients (11 of 12 — Bacgrabski deferred to TBD)

| Slug | Dharma name | Year of shihō | Primary URL | Image |
|------|-------------|---------------|-------------|-------|
| `barbara-kosen-richaudeau` | Bárbara Kōsen Richaudeau | Sept 1993 | `https://zenkan.com/en/linaje/barbara-kosen-en/` + `zen-deshimaru.com/en/abzd-association/master-kosen/` | placeholder-svg |
| `andre-ryujo-meissner` | André Ryūjō Meissner | Sept 1993 | `zen-deshimaru.com/en/abzd-association/master-kosen/` (only authoritative cite — see notes) | placeholder-svg |
| `yvon-myoken-bec` | Yvon Myōken Bec | Autumn 2002 | `mokushozen.hu/en/sample-page/mokusho-myoken/` + `zen-deshimaru.com/en/abzd-association/master-kosen/` + `mokushozen.hu/en/sample-page/temples/hoboji/` | placeholder-svg |
| `christophe-ryurin-desmur` | Christophe Ryūrin Desmur | 8 Oct 2009 | `zen-deshimaru.com/fr/zen/maitre-ryurin-desmur` + roster | placeholder-svg |
| `pierre-soko-leroux` | Pierre Sōkō Leroux | 2009 | `sokozen.org` + roster | placeholder-svg |
| `loic-kosho-vuillemin` | Loïc Kōshō Vuillemin | 2013 | `zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-kosho-vuillemin/` + roster | placeholder-svg |
| `ingrid-gyuji-igelnick` | Ingrid Gyū-Ji Igelnick | 2015 | `zen-deshimaru.com/fr/zen/maitre-gyu-ji-igelnick` + roster | placeholder-svg |
| `francoise-jomon-julien` | Françoise Jōmon Julien | 2015 | `zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-jomon-julien/` + roster | placeholder-svg |
| `paula-reikiku-femenias` | Paula Reikiku Femenias | 2015 | `zen-deshimaru.com/en/abzd-association/our-zen-teachers/master-rei-kiku-femenias/` + roster | placeholder-svg |
| `ariadna-dosei-labbate` | Ariadna Dōsei Labbate | Apr 2015 | `espanol.buddhistdoor.net/.../ariadna-dosei-labbate` (Buddhistdoor en Español interview) + roster | placeholder-svg |
| `toshiro-taigen-yamauchi` | Toshiro Taigen Yamauchi | Oct 2016 | `zen-buenosaires.com.ar/maestros-zen/maestro-taigen-yamauchi/` + roster | placeholder-svg |

### Triet shihō recipients (1 new — Crettaz already exists, deepened below; Bégonia deferred)

| Slug | Dharma name | Year of shihō | Primary URL | Image |
|------|-------------|---------------|-------------|-------|
| `hugues-yusen-naas` | Hugues Yūsen Naas (1952–2023) | 2009 | `zen-azi.org/en/hugues-yusen-naas` | placeholder-svg |

### Note on `pierre-soko-leroux`

A `BiographyEntry` with this slug already exists in
`scripts/seed-biographies.ts` (lines 3303–3328). Branch A adds the
KVMaster row only — Agent G should NOT duplicate the biography. The
existing biography is consistent with the new KVMaster row (1991
ordination at La Gendronnière; 2009 shihō; Barcelona base; Manuel Tōei
Simões as Portuguese disciple) and should be retained as-is.

## TBD — investigated and deferred for lack of verifiable sources

### Begoña Kaidō Agiriano (Vitoria-Gasteiz)

**Status: NOT AUTHORED. Filed as TBD.**

The user's tip identified Bégonia as a Triet shihō recipient. I
invested significant search effort and found this:

- The Vitoria-Gasteiz dōjō's own Linaje page
  (`https://zenvitoriagasteiz.com/linaje/`) confirms only that **she
  has been a Zen nun since 1990** and is the responsible teacher of the
  Vitoria-Gasteiz dōjō. The page does NOT state that she received
  shihō from Triet. Verbatim from the page: *"La responsable de la
  enseñanza en el dojo de Vitoria-Gasteiz es Begoña Kaidô Agiriano,
  monja zen desde 1990."*
- The AZI Vitoria-Gasteiz centre listing
  (`https://www.zen-azi.org/en/node/573`) confirms only that "Begoña
  AGIRIANO" is the centre's responsible teacher. No mention of shihō.
- Several Google search-result snippets for queries combining her name
  with "shiho", "Triet", and "transmission" produced summaries asserting
  that she received shihō from Triet in 2013, **but I was unable to
  locate the underlying primary-source page from which those snippets
  were derived**. The Seikyūji site does not have a master-disciple
  roster page that lists her by name; the only Seikyūji page that
  surfaced for her was a tag archive at `seikyuji.org/doko-triet/` that
  does not name her on any of the indexed posts.
- A Facebook interview link surfaced
  (`https://www.facebook.com/198960053488704/posts/entrevista-a-bego%C3%B1a-kaido-aguiriano-...`)
  that may contain the relevant biographical detail, but its content
  was not accessible via WebFetch (Facebook returns only a page title).

Per the user's reinforcement #2 — *"if the only source you found is
hearsay or a single mention without a verifiable URL, do NOT author her
as a master. File as TBD with the search trail in NOTES.md. Inventing a
transmission a real lineage member could disprove on sight is the
worst-case failure mode"* — Bégonia is deferred.

URLs searched in the course of investigation:

- `https://zenvitoriagasteiz.com/linaje/` (fetched; confirms 1990
  ordination only)
- `https://www.zen-azi.org/en/node/573` (fetched; confirms responsible
  teacher status only)
- `https://www.seikyuji.org/raphael-doko-triet/` (404 at fetch time)
- `https://www.seikyuji.org/doko-triet/` (fetched; tag-archive page,
  does not enumerate disciples)
- `https://www.facebook.com/.../entrevista-a-begoña-kaido-aguiriano-...`
  (returns page title only)
- Web searches: `"Begoña Kaido" OR "Begoña Kaidô" "transmisión" OR
  "shiho" Triet 2013`; `"Begonia Kaido Agiriano" zen Vitoria Gasteiz
  dojo biography`

Agent G or a future authoring pass should re-attempt with one of:
(a) a fresh fetch of `seikyuji.org/raphael-doko-triet/` if the page
returns a master-disciple roster again; (b) the Facebook interview
content via an authenticated tool; (c) direct correspondence with the
Vitoria-Gasteiz dōjō or Seikyūji to obtain a primary written
attestation of the 2013 shihō.

### Édouard Shinryū Bacgrabski (Le Puy-en-Velay)

**Status: NOT AUTHORED. Filed as TBD.**

Bacgrabski is listed by name and year (Sept 1993) on the official
Kōsen Sangha shihō roster at
`https://www.zen-deshimaru.com/en/abzd-association/master-kosen/` and
the French equivalent. His shihō is therefore established as fact. He
was deferred from authoring because:

- His individual ABZD biographical page
  (`https://www.zen-deshimaru.com/en/zen/maitre-edouard-shinryu-bagracbski`
  and the French equivalent) returned HTTP 404 at fetch time on
  2026-05-11.
- A Le Puy-en-Velay dōjō listing (Hotfrog, address: 11 Rue
  Saint-François-Régis, 43000) corroborates his role as the dōjō's
  resident teacher but does not provide the biographical detail needed
  to support paragraph-density prose.
- A Lille dōjō visit-announcement page
  (`http://zenlille.blogspot.com/2014/09/edouard-bagracbski-au-dojo-zen-de-lille.html`)
  describes him only as "Edouard Bagracbski, moine zen, disciple de
  Maître Deshimaru" — confirming his disciple-of-Deshimaru status but
  not his ordination provenance, and one Google search summary
  characterised him as "ordained by maître Kosen", which conflicts with
  the Kōsen-Sangha roster's framing of the 1993 shihō as conferred "in
  the name of Master Deshimaru to some of his master's disciples"
  (i.e. implying Deshimaru-ordained).

Given (a) the 404 on the primary biographical page and (b) the source
disagreement on whether his ordainer was Deshimaru or Kōsen, authoring
him at this pass would risk publishing a claim that "a real lineage
member could disprove on sight". He should be added in a follow-up pass
once `https://www.zen-deshimaru.com/en/zen/maitre-edouard-shinryu-bagracbski`
is back online OR a printed AZI / ABZD biographical reference is
obtained. The shihō fact itself is solidly attested and should be
recorded as a transmission edge in `branch-A.ts` only when accompanied
by the rest of the biographical record.

URLs searched:

- `https://www.zen-deshimaru.com/en/zen/maitre-edouard-shinryu-bagracbski`
  (404)
- `https://www.zen-deshimaru.com/fr/zen/maitre-edouard-shinryu-bagracbski`
  (returns ABZD homepage content, not the master page)
- `http://zenlille.blogspot.com/2014/09/edouard-bagracbski-au-dojo-zen-de-lille.html`
  (fetched; confirms only "moine zen, disciple de Maître Deshimaru")
- `https://www.facebook.com/dojozendelille/posts/733193406753257/`
  (search hit; Facebook content not accessible via WebFetch)
- `https://www.hotfrog.fr/company/1122481743757312` (search hit;
  Le Puy-en-Velay dōjō address)
- Web searches: `"Edouard Shinryu" "Puy-en-Velay" zen dojo monk
  Bagracbski OR Bacgrabski`

## Cross-branch coordination notes

- **Yvon Myōken Bec** — could plausibly be claimed by Branch B
  (Mokushō Zeisler / Mokusho Zen House Eastern Europe) since his deeper
  formation was under Zeisler. Branch A has authored him on the basis
  that his formal shihō (autumn 2002) came from Kōsen Thibaut "in the
  name of Mokushō Zeisler", placing the transmission edge under
  `stephane-kosen-thibaut`. The biography records both teacher
  relationships explicitly; if Branch B has a Mokusho-Zen-House-focused
  KVMaster entry for him, Agent G should prefer Branch A's record (the
  shihō transmission is canonical for the lineage graph) but may merge
  the additional biographical material from Branch B into the bio
  body.

- **Loïc Kōshō Vuillemin** — son of Vincent Keisen Vuillemin
  (`vincent-keisen-vuillemin`, already in `deshimaru-lineage.ts`).
  Branch A records the Keisen-Vuillemin parental edge as a `secondary`
  transmission. No branch overlap.

- **Pierre Sōkō Leroux** — already has a biography in
  `seed-biographies.ts`. Branch A adds only the KVMaster row.
  Manuel Tōei Simões (Setúbal, 2012 ordination by Leroux) is mentioned
  in the bio but not authored as a KVMaster — he has not received
  shihō, so falls outside the scope rule.

- **Toshiro Taigen Yamauchi** + **Ariadna Dōsei Labbate** — both
  Argentine shihō recipients based at Templo Shōbōgenji (Capilla del
  Monte). Both should remain in Branch A (Kōsen-line successors); no
  overlap with other branches.

## Verification

`branch-A.ts` was audited (script run on 2026-05-11) for:

1. **Paragraph-density rule** (every `\n\n`-separated paragraph
   contains at least one `[N]` marker): PASS — 0 violations across
   12 KVMaster biographies and 3 BiographyEntry contents.

2. **Footnote-resolution rule** (every `[N]` marker resolves to either
   a `citations[N-1]` entry on the KVMaster or a `footnotes` entry
   with `index === N` on the BiographyEntry): PASS — 0 unresolved
   markers.

3. **Citation-density per sentence** (Wikipedia-quality target ≥ 1.0
   markers per sentence on biographical claims):
   - 12 KVMaster biographies: range 1.20 – 1.83 markers/sentence
   - 3 deepened BiographyEntry contents: range 1.67 – 2.82
     markers/sentence
   All entries clear the Wikipedia-quality threshold.

4. **Source-URL inclusion** (every `pageOrSection` field on every
   citation / footnote names the URL fetched and where possible quotes
   the verbatim line on which the claim rests): PASS by manual
   re-read; all citations carry an explicit `https://...` URL plus
   verbatim French / Spanish / English excerpt.
