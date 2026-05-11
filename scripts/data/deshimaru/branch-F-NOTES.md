# Branch F — research notes

Scope: American line (NOZT) + Lausanne (Bovay) + de Smedt.

## Authored figures (new KVMaster + long-form BiographyEntry)

### Robert Livingston Roshi (1933–2021), `slug: robert-livingston`
- Born NYC, 28 January 1933; died New Orleans, 2 January 2021.
- Cornell undergrad; U.S. Army Japan/Korea early 1950s; NYSE, then ten years
  in international finance in Europe.
- Met Deshimaru in Paris in the 1970s; close disciple; made a Zen teacher by
  Deshimaru. Deshimaru asked him before his death (1982) to return to the U.S.
  and open a dōjō.
- Founded the **American Zen Association in 1983**; opened the
  **New Orleans Zen Temple at 748 Camp Street in 1991**.
  (Wikipedia article uses 1984 for "founded the temple"; the AZA's own site
  uses 1983 for the association and 1991 for the building. I follow the AZA's
  own framing.)
- Retired 2016 after transmitting to Collins.
- **Two named dharma heirs**: Tony Bland (shihō 2004) and Richard Reishin
  Collins (shihō 1 January 2016).
- Sources used: `src_wikipedia` (Robert Livingston Zen teacher), `src_new_orleans_zen_temple`.

### Richard Reishin Collins (b. 1952), `slug: richard-reishin-collins`
- Born Eugene, Oregon, 1952; English / comparative-literature academic.
- Began Zen with Livingston 2001; monastic ordination 2010; permission to
  teach 2012; **shihō from Livingston at midnight 31 Dec 2015 / 1 Jan 2016**
  in the dōjō at 748 Camp Street; Livingston handed over his kotsu.
- Second abbot of NOZT from 2016. Resides Sewanee, TN; directs Stone Nest Dōjō.
- Author *No Fear Zen: Discovering Balance in an Unbalanced World* (Hohm Press, 2015).
- Sources used: `src_new_orleans_zen_temple`, `src_wikipedia`.

### Tony Bland (b. 1946), `slug: tony-bland` — INCLUDED
- The branch-F prompt allowed Bland only if formal shihō was documented.
- **It is documented.** zeninmississippi.org → "About Us > The Teacher":
  "In 2004, Tony received the shiho (Dharma transmission) from Livingston-Roshi,
  thus becoming a fully authorized lineage holder and independent teacher."
  This is corroborated by the NOZT lineage statement that Livingston has two
  successors, Bland and Collins.
- Born Starkville MS 1946; B.A. Ole Miss 1968; M.A. counselling Arkansas 1980;
  began with Livingston in NOLA 1984; lay 1985 / monk 1992 / shusso 1998;
  **shihō 2004**.
- Founded Starkville Zen Dōjō 1994; teaches from there since 2004.
- Source used: `src_new_orleans_zen_temple` (covers both NOZT and the affiliated
  Mississippi dōjō; the Mississippi site URL is registered there).

### Eishuku Monika Leibundgut, `slug: monika-leibundgut`
- Designated successor of Michel Bovay at Zen Dōjō Zürich.
- Bodhisattva 1986; nun 1988; assistant to Bovay >20 years; Bovay handed over
  responsibility 2007; Bovay supported her until his death 2009.
- **Hossen-shiki at Teishōji 2012; shihō from Yūkō Okamoto Roshi 2013;**
  zuise at Eihei-ji and Sōji-ji with Zürich/Vienna sanghas.
  (This is the same route Bovay himself took: Bovay's own shihō was from
  Okamoto Roshi at Teishōji in 1998. Per AZI convention, this is treated as
  a transmission **in the Bovay neighbourhood**: teacherSlug for the
  transmission edge is `michel-reiku-bovay`, with the Okamoto-Roshi
  paperwork-route documented in the `notes` field.)
- Birth year not found in public sources — left null with `birthConfidence: medium`.
- Edited Bovay's posthumous *Deshimaru — Histoires vécues avec un maître zen*
  (Le Relié, 2022).
- Sources used: `src_dojo_lausanne` (proxy ID for zen.ch / Muijoji), `src_azi`.

## Existing KVMasters deepened (long-form BiographyEntry only)

- **michel-reiku-bovay** — long-form bio added covering early life
  (1944, Monthey; rock musician), 1972 meeting Deshimaru, 1985 return to
  Switzerland and re-founding of Zen Dōjō Zürich, 1995–2003 AZI presidency,
  1998 shihō from Okamoto Roshi at Teishōji, 1987 *Zen* (Cerf), 2007 handover
  to Leibundgut, 2009 death, 2022 posthumous memoir.
  - **Discrepancy with existing KVMaster bio**: the existing seed-data bio
    in `scripts/data/deshimaru-lineage.ts` says Bovay was born 1949 and
    "founded the Zen Dōjō de Lausanne." Multiple authoritative sources
    (zen.ch / Muijoji, AZI, Cultura, Decitre book listings) instead give:
    **born 1944 in Monthey** and **principal teacher / re-founder of the
    Zen Dōjō Zürich** (the dōjō originally founded by Deshimaru in 1975).
    The Lausanne / Romandie network was indeed extended through his AZI
    activity, but his primary teaching seat from 1985 was Zürich. I have
    NOT edited the deshimaru-lineage.ts file (per branch-F constraints);
    the deepened BiographyEntry uses the corrected dates and venue. A
    follow-up correction to the KVMaster row in deshimaru-lineage.ts
    should be filed by the orchestrator.
- **evelyne-eko-de-smedt** — long-form bio added covering birth
  (20 November 1945, Sologne), 1973 meeting Deshimaru, 1975 nun ordination,
  editorial role on *L'Anneau de la Voie* and Deshimaru's posthumous prefaces,
  vice-presidency of Paris Zen Dōjō, 2005 founding of Mokuon-Ji (Quercy blanc),
  May 2009 shusso ceremony at Kongō-in with Genshū Imamura Roshi, books
  (*Zen et christianisme*, *Les Patriarches du Zen*, *L'Esprit du Zen* with
  Crépon).

## Rejected / not-authored

- **No de Smedt shihō recipients found.** Évelyne Reiko de Smedt has
  performed the shusso ceremony in Japan (May 2009, with Genshū Imamura
  Roshi at Kongō-in) — a recognition step on the Sōtō ceremonial path,
  but **not itself shihō to a successor**. Public AZI / Mokuonji material
  documents her own teaching but names no individual she has transmitted
  to. Per branch-F constraints, no de Smedt-line successors authored.
  The deepened bio for de Smedt herself is included.

- **No Bovay shihō recipients in the Lausanne / Romandie line.**
  The only documented Bovay successor is Eishuku Monika Leibundgut at
  the Zen Dōjō Zürich (see above) — included under that slug. The
  Lausanne dōjō (zen-lausanne.ch) is part of the wider AZI Romandie
  network but no shihō recipient based there is documented under
  Bovay's name.

## Image plans (not implemented in this branch)

- `robert-livingston` — Wikipedia article exists at
  `en.wikipedia.org/wiki/Robert_Livingston_(Zen_teacher)`; pageimage
  may resolve. To be added by the next `fetch-kv-images.ts` pass.
- `richard-reishin-collins` — author photo on the *No Fear Zen* (Hohm Press)
  book page; portrait on neworleanszentemple.org. No Wikipedia pageimage.
  Defer to placeholder until institutional source is verified.
- `tony-bland` — portrait on zeninmississippi.org "About Us > The Teacher".
  Verify rights before adding to `EXTERNAL_PORTRAITS`. Defer to placeholder.
- `monika-leibundgut` — portraits on zen.ch (Muijoji) and zen.wien event
  pages. Defer to placeholder until institutional source is verified.

## Source IDs used (all already registered in `scripts/seed-sources.ts`)

- `src_wikipedia`
- `src_new_orleans_zen_temple`
- `src_dojo_lausanne` (used as the proxy for the Swiss AZI sources —
  zen.ch / Muijoji — covering the Bovay-Leibundgut Zürich line; an
  additional `src_zen_zurich` source ID could be added in a follow-up)
- `src_azi`

## Open questions / TBD

- Confirm Monika Leibundgut's birth year (not on zen.ch English bio).
- Decide whether `monika-leibundgut`'s transmission edge should also
  carry a secondary `teacherSlug: "yuko-okamoto"` row once an Okamoto
  Roshi master is added to the database.
- The Bovay birth-year (1944 vs. existing 1949) and Lausanne-vs-Zürich
  primary venue should be reconciled in a follow-up edit to
  `scripts/data/deshimaru-lineage.ts`.
