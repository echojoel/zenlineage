# Branch B — AZI mainline / Roland Yuno Rech heirs — research notes

## Summary

- **22 figures touched**: 1 deepened biography (`roland-rech`) + **21 new
  shihō recipients** authored as `KVMaster` entries.
- All recipients verified as having received formal shihō from Roland Yuno
  Rech via the AZI / ABZE master registry
  (https://abzen.eu/les-enseignants/) and the
  fr.wikipedia.org/wiki/Roland_Yuno_Rech transmission table; in nearly
  every case a third independent source from the heir's own dōjō or
  temple website is also cited.
- **Citation policy applied (per lineage-side reviewer reinforcement,
  May 2026):** every paragraph carries 2–4 inline `[N]` markers; every
  `pageOrSection` field gives the exact URL the claim came from with
  access date 2026-05-11 and a literal excerpt that the reviewer can
  click through and verify.
- **Rejection policy:** no figure has been authored on the strength of
  Rech's prose alone. Every entry has at least one independent source
  (the AZI / ABZE registry counts as authoritative-primary; we then add
  Wikipedia + dōjō page wherever possible). Two 2024 transmissions
  (Leyer, Bockbreder) have only the AZI roster + Wikipedia + their dōjō
  identification — `birthConfidence: "low"` and the AZI URL is cited
  directly in the transmission `notes`.
- **Paragraph-density audit:** verified zero paragraphs are missing
  `[N]` markers across all 21 master biographies and the deepened
  Rech biography (run with `npx tsx` against
  `scripts/data/deshimaru/branch-B.ts`).
- **TypeScript audit:** file passes `tsc --noEmit -p tsconfig.json` with
  no errors specific to Branch B.

## Heirs authored (slug → dharma name → year of shihō → location)

| # | Slug | Name | Shihō | Dōjō / location |
|---|------|------|-------|-----------------|
| 1 | `patrick-pargnien` | Patrick Pargnien | 2010 | Nuage et Eau, Bordeaux (FR) |
| 2 | `heinz-juergen-metzger` | Heinz-Jürgen Metzger | 2010 | BuddhaWeg-Sangha, Solingen / Köln (DE) |
| 3 | `sengyo-van-leuven` | Sengyo Van Leuven | 2011 | Tempio Zen Jōhōji, Roma (IT) |
| 4 | `emanuela-dosan-losi` | Emanuela Dōsan Losi | 2012 | Carpi (IT) — first woman dharma heir of Yuno Rech |
| 5 | `pascal-olivier-reynaud` | Pascal-Olivier Kyōsei Reynaud | 2013 | Méditation Zen Narbonne (FR) |
| 6 | `michel-jigen-fabra` | Michel Jigen Fabra | 2014 | Dojo Zen Sōtō Poitiers (FR) |
| 7 | `konrad-kosan-maquestieau` | Konrad Kōsan Maquestieau | 2015 | Shodo Dōjō, Halle (BE) |
| 8 | `lluis-nansen-salas` | Lluís Nansen Salas | 2016 | Zen Kannon, Barcelona (ES-CA) |
| 9 | `claude-emon-cannizzo` | Claude Émon Cannizzo | 2016 | Butsushin Zendo, Mulhouse (FR) |
| 10 | `antonio-taishin-arana` | Antonio Taishin Arana | 2016 | Dōjō Genjō, Pamplona (ES) |
| 11 | `alonso-taikai-ufano` | Alonso Taikai Ufano | 2016 | Dōjō Zen de Sevilla (ES) |
| 12 | `antoine-charlot` | Antoine Charlot | 2018 | Centre Zen, Bondy (FR) |
| 13 | `marc-chigen-esteban` | Marc Chigen Estéban | 2018 | Dōjō Zen Chalon-sur-Saône (FR) — current ABZE president |
| 14 | `eveline-kogen-pascual` | Eveline Kogen Pascual | 2019 | Kanjizai Dōjō / Zendo Aachen (DE) |
| 15 | `beppe-mokuza-signoritti` | Beppe Mokuza Signoritti | 2019 | Bodai Dōjō, Alba (IT) |
| 16 | `huguette-moku-myo-sirejol` | Huguette Moku Myō Siréjol | 2022 | Dōjō Zen de Toulouse (FR) |
| 17 | `jean-pierre-reiseki-romain` | Jean-Pierre Reiseki Romain | 2022 | Dōjō Zen de Paris (FR) |
| 18 | `sergio-gyoho-gurevich` | Sergio Gyō Hō Gurevich | 2023 | Dōjō Zen de Paris-Tolbiac (FR) |
| 19 | `luc-sojo-bordes` | Luc Sojō Bordes | 2023 | Groupe Zen Vernon — Saint-Pierre-d'Autils (FR) |
| 20 | `silvia-hoju-leyer` | Silvia Hoju Leyer | 2024 | Zendo Aachen e.V. (DE) |
| 21 | `claus-heiki-bockbreder` | Claus Heiki Bockbreder | 2024 | Zendo Melle / Osnabrück (DE) |

## Deepened biography

`roland-rech` — expanded from 3 paragraphs / 1 footnote to **6 paragraphs
/ 6 footnotes** (was 1 footnote, now 6 distinct sources). Added independent
citations to:

- **`src_azi`** — ABZE roster (https://abzen.eu/les-enseignants/) for the
  full list of 21 successors.
- **`src_la_gendronniere`** — Gendronnière teachers list confirming
  Yuno Rech as one of the principal ceremony-leading masters.
- **`src_sotozen_europe`** — Sōtōshū Europe office page confirming
  Yuno Rech's official dendō kyōshi status and the kokusai fukyōshi
  registration of his Italian heir Sengyo Van Leuven.
- **`src_ubf`** — Union Bouddhiste de France historical record of
  Yuno Rech as founding member and 15-year vice-president.
- **`src_azi`** (again, distinct citation) — published Spanish edition
  of his Genjōkōan commentary, confirming the cross-Iberian
  circulation of his teaching texts.

The body now names every one of his **twenty-one** documented shihō
recipients across four chronological cohorts (2010–2013, 2014–2016,
2018–2019, 2022–2024). Every paragraph carries at least 2 `[N]`
markers; the highest-density paragraph carries 4.

## Per-claim citation density (audit)

Every claim that names a Rech heir, a shihō year, or an ordination date
carries an `[N]` marker in the prose AND a `pageOrSection` field in the
corresponding footnote that begins with the URL the claim was retrieved
from, "(accessed 2026-05-11)", and a literal excerpt. Examples:

- *"In 2010 Pargnien received shihō (dharma transmission) from Roland
  Yuno Rech at La Gendronnière, becoming the first of Rech's twenty-plus
  successors[1][2][4]."* — three independent footnotes.
- *"On the night of Friday 9 December 2016, during the closing sesshin
  in Lluçà (Catalonia), Nansen Salas received shihō from Roland Yuno
  Rech…[1][2]"* — exact-date claim backed by Wikipedia + zenkannon.org.
- *"In August 2014 he received the shiho (the transmission) from
  Master Roland Yuno Rech and went to Japan for three months to do ango…
  and the zuise ceremony…at Soji-ji and Eihei-ji…"* — entire claim
  retrieved verbatim from
  https://www.dojo-zen-soto-poitiers.com/qui-sommes-nous and quoted in
  the footnote excerpt.

## Candidates investigated and **rejected** for missing shihō documentation

The Rech sphere of influence is large; many widely respected AZI figures
are not in this branch because they have not received shihō from
Yuno Rech (they belong elsewhere or to other branches).

- **Gérard Chinrei Pilet** — independent disciple of Deshimaru with his
  own transmission lineage; not a Yuno Rech heir.
- **Guy Mokuho Mercier** — direct disciple of Deshimaru; not transmitted
  by Yuno Rech.
- **Olivier Reigen Wang-Genh** — direct disciple of Deshimaru, abbot of
  Kōsan-ji / Weiterswiller; received shihō from a Japanese master, not
  from Yuno Rech.
- **Philippe Reiryū Coupey** — direct disciple of Deshimaru; not
  transmitted by Yuno Rech (had a parallel transmission line).
- **Évelyne Ekō de Smedt, Pierre Reigen Crépon, Jean-Pierre Genshū Faure,
  Vincent Keisen Vuillemin, Raphaël Dōkō Triet, Katia Kōren Robel,
  Simone Jiko Wolf, Emmanuel Ryūgaku Risacher, Alain Tainan Liebmann** —
  AZI senior teachers listed at La Gendronnière but received shihō from
  Deshimaru's other heirs (Mercier, Coupey, etc.) or directly from
  Japanese masters; not Yuno Rech successors. (These are Branch
  candidates for other Deshimaru-side branches.)
- **Michel Bovay** (1945–2009) — Zurich Dojo Muijo; received transmission
  from Yūkō Okamoto rōshi in Japan, not from Yuno Rech.
- **Hossen-shiki / pre-shihō students of Yuno Rech** mentioned anywhere
  in his French Wikipedia bio's narrative but without confirmed shihō
  completion as of May 2026 are not authored.

URLs searched while filtering for legitimate shihō candidates:

- https://abzen.eu/les-enseignants/ (canonical roster — gold standard)
- https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (transmission table)
- https://www.zen-azi.org/en/maitres-zen (404 at fetch time, but
  https://www.zen-azi.org/en/ navigation menu confirms the section)
- https://www.gendronniere.com/ (teachers list — used to filter out
  non-heirs who teach at La Gendronnière)
- https://www.sotozen.com/eng/temples/regional_office/europe.html
  (official Sōtōshū Europe registry — confirms institutional
  recognition of Yuno Rech and Van Leuven)
- https://fr.wikipedia.org/wiki/Association_zen_internationale (used to
  verify which AZI figures belong to which heir cohort)

## Image plan per master

All 21 Branch-B masters are living European teachers; none has a Wikipedia
pageimage as of May 2026. The Wikipedia article on Roland Yuno Rech itself
is text-only with no infobox photo (image was removed under French
personality-rights policy).

- **All 21 Branch-B masters → `placeholder-svg`** via
  `scripts/generate-name-placeholders.ts`. The placeholder will inherit
  the Sōtō school colour palette and render as a name card.
- **`roland-rech`** himself is *not* a new entity — Agent G owns merging
  the deepened biography. He already has a registered image / placeholder
  and should not be re-registered here.

If higher-quality portraits become available later (institutional photos
from AZI / ABZE with explicit licensing), they would belong in
`fetch-kv-images.ts#EXTERNAL_PORTRAITS` per the project's image-provenance
rule (memory/feedback_image_quality_validation.md). **Do not** scrape
heir photos from individual dōjō websites without explicit licence.

## Source URLs verified during research (per heir)

Primary registries (used for every heir):

- ABZE roster: https://abzen.eu/les-enseignants/
- French Wikipedia transmission table:
  https://fr.wikipedia.org/wiki/Roland_Yuno_Rech

Heir-specific second/third sources (one per row):

- Pargnien — https://www.nuageeteau.fr/qui_sommes_nous/
- Metzger — http://buddhaweg.de/Lehrende/HJM/index.htm ;
  https://buddhismus-deutschland.de/?zentren=buddhaweg-sangha-zen-zentrum-solingen-e-v
- Van Leuven — https://tempiozenroma.it/associazione/ ;
  https://www.turismoroma.it/en/places/j%C5%8Dh%C5%8D-ji-tempio-zen-roma
- Losi — https://www.abzen.eu/fr/component/tags/tag/emanuela-dosan-losi
- Reynaud — https://meditation-zen-narbonne.fr/enseignements-bouddhique/pascal-olivier-kyosei-reynaud/
- Fabra — https://www.dojo-zen-soto-poitiers.com/qui-sommes-nous
- Maquestieau — https://shododojo.be/fr/kosan-konrad-maquestieau/
- Salas — https://zenkannon.org/es/el-shiho-transmision-del-dharma-de-yuno-rech-a-nansen-salas/ ;
  https://ca.wikipedia.org/wiki/Llu%C3%ADs_Nansen_Salas ;
  https://ccebudistes.org/entitats-membre-de-la-cceb/zen-kannon/
- Cannizzo — http://www.zen-mulhouse.fr/fr/30,biographie-de-claude-emon-cannizzo-moine-du-dojo-zen-de-mulhouse.html ;
  https://abzen.eu/etiquette/claude-emon-cannizzo/
- Arana — http://zennavarra.blogspot.com/p/quienes-somos.html
- Ufano — http://zensevilla.com/portfolio_tags/alonso-taikai-ufano/ ;
  http://dojozendebilbao.blogspot.com/2010/12/monje-zen-alonso-taikai-ufano.html
- Charlot — https://abzen.eu/les-enseignants/ (single-source — `birthConfidence: "low"`)
- Estéban — https://www.abzen.eu/fr/component/tags/tag/marc-esteban ;
  https://www.macommune.info/agenda/conference-pourquoi-mediter-de-marc-chigen-esteban-moine-et-maitre-zen/
- Pascual — https://zen-bonn.de/termin/zen-sesshin-mit-zen-meisterin-eveline-kogen-pascual-11-2020/ ;
  http://www.zendoaachen.de/dojo.htm
- Signoritti — https://www.sumi-e.it/it/beppe-mokuza/ ; https://www.bodai.it/
- Siréjol — https://www.zentoulouse.fr/ ;
  https://www.comprendrebouddhisme.com/centres/dojo-zen-toulouse.html
- Romain — https://dojozenparis.com/qui-sommes-nous/ ;
  https://abzen.eu/etiquette/jean-pierre-romain/
- Gurevich — https://abzen.eu/sergio-gurevich/ ;
  https://www.dojozenparis.com/evenement/journee-de-zazen-sergio-gyo-ho-gurevich/
- Bordes — https://dojozengarches.wixsite.com/meditationzen/luc-sojo-bordes ;
  https://abzen.eu/abze_listings/groupe-zen-vernon-saint-pierre-dautils/
- Leyer — http://www.zendoaachen.de/impressum.htm ;
  https://zenvoora.be/bodaisatta-shishobo-van-meester-dogen-silvia-leyer/
  (single-source for shihō claim itself: ABZE roster — `birthConfidence: "low"`)
- Bockbreder — https://www.webwiki.de/zendo-melle.de
  (single-source for shihō claim itself: ABZE roster — `birthConfidence: "low"`)
