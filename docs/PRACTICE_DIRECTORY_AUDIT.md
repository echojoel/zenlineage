# Practice directory audit — 8 October 2026

This is a **triage pass**, not a claim that every place has been personally
verified. It combines a fresh seed of the canonical place records with a
read-only HTTP check of all preferred URLs on 8 October. HTTP results do not
establish a group's current activity, lineage, or safeguarding.

## Coverage

| Check | Result |
|---|---:|
| Place records | 1,641 |
| Distinct preferred URLs checked | 1,341 |
| URLs returning 2xx/3xx | 1,148 (used by 1,435 records) |
| URLs returning 404/410 | 2 (used by 2 records) |
| URLs blocked or rate limited | 20 (used by 22 records) |
| URLs with inconclusive network/server results | 171 (used by 182 records) |
| Records with no preferred URL | 0 |
| Records with only a `popular`-class citation | 346 |
| Records needing an item-level check because their sole citation is broad | 47 |
| Records queued to check first (overlapping signals combined) | 395 |
| City-level, approximate map pins | 827 |

Every remaining place has exactly one citation, currently attached to `coordinates`.
That citation alone cannot establish affiliation, an active schedule, or a
safeguarding process. The seed labels all 1,641 places `active`, but it has no
per-place last-checked date. The public map and exported JSON no longer expose
that seed status as a verified claim.

The 47 broad-page citations comprise 44 rows citing Plum Village's
[monastic centres page](https://plumvillage.org/community/monastic-practice-centres)
and 3 citing the [White Plum founder page](https://whiteplum.org/founder/).
Those pages do not individually support all the lay groups assigned to them.
The review queue now flags each for a direct group or institutional listing.
This is a limitation of our citations, not a claim that any group has doubtful
origins.

The 404/410 set needs human confirmation before changing or removing entries.
For example, the automated client received a 404 from the
[Sōtōshū Shōbōji page](https://www.sotozen.com/eng/temples/jp/shoboji.html),
which remains accessible in a browser and in search. Some other sites may behave
similarly. A failed URL is evidence about this check, not about the group.
The other automated 404 came from Plum Village UK's
[Two Rivers Sangha page](https://plumvillage.uk/group/two-rivers-sangha/),
which remains indexed and available through the site in a browser. The
automated client likewise returned a 404 from Sōtōshū's
[Aichi Senmon Nisōdō page](https://www.sotozen.com/ita/temples/jp/shoboji.html),
which opened in a browser. Its old English path was broken; the official
Italian-language page is the current preferred link.

## Corrections made during this pass

- The map no longer calls every preferred link an “Official website.” Some
  preferred links are Wikipedia pages or third-party directories. It now says
  “Website or listing.”
- The European and global research-note sources no longer cite the site's own
  practice page as if it were independent evidence. Their seed metadata is
  classified as `popular`, not `primary`.
- The coverage audit now counts “website/listing URLs,” not “official URLs.”
- The public JSON no longer exports the unverified `active` seed status.
- Kwan Um Europe's [Paris group page](https://www.kwanumeurope.org/locations/paris-zen-group/)
  says it is currently inactive as of January 2026. Its map listing was
  removed pending a current practice source.
- Three Hungarian Kwan Um links now lead to the group's
  [current center page](https://kvanumzen.hu/hu/budapesti-zen-kozpont/) or
  [events calendar](https://kvanumzen.hu/en/our-planned-events). An old
  teacher claim was removed from the raw research notes.
- The map can show optional visitor details with a source and check date.
  The first example uses Zen Mountain Monastery's
  [visitor information](https://zmm.org/visiting-the-monastery/).
- Guin-sa was removed because the temple's
  [own temple-stay listing](https://eng.templestay.com/en/MI000000000000000062/temple/introView.do?pageIndex=1&searchKeyword=guinsa&templeIdTmp=Guinsa)
  identifies it as the Cheontae Order's headquarters, outside this
  Zen/Seon directory's scope. This is a classification correction, not a
  safeguarding judgment.
- Heart of Wisdom Zen Temple now links to its
  [current temple page](https://zendust.org/heart-of-wisdom-zen-temple/).
- [Dojo Zen Lleida](https://zenlleida.org/dojo/) now has its current address,
  approximate map pin, schedule and regular-practice cost details, each checked
  against its own site. The former Anselm Clavé address was obsolete.
- [Groupe Zen de Caen](https://www.zen-azi.org/fr/node/456),
  [Toruń](https://www.kwanumeurope.org/locations/torun-zen-group/) and
  [Głogów](https://www.kwanumeurope.org/locations/glogow-zen-group/) now link
  to individual pages maintained by their respective Zen associations.
- Awaken Mindfulness Centre Singapore was removed pending a current source:
  its preferred domain now presents a counselling service, while the broad
  Plum Village page cited in the seed does not identify that specific sangha.
  This is a listing-evidence decision, not a conduct finding.
- Twelve Belgian lay sanghas now link to their individual pages in
  [Leven in Aandacht's sangha directory](https://aandacht.net/meditatiegroepen/sangha-vinden2).
  The Antwerp Lotusknop page supplied a different meeting address, so its
  old exact pin was corrected. The Gent and Baardegem meeting locations were
  updated from their group pages. These listings support practice in the
  Thich Nhat Hanh tradition, without proving formal Plum Village membership.
- The [AZI Kortrijk](https://www.zen-azi.org/en/node/676) and
  [Garches](https://www.zen-azi.org/en/node/466) listings supplied updated
  addresses, and the [Coutras dojo](https://dojo-zen-coutras.fr/) is linked
  from [Kanshoji's practice directory](https://www.kanshoji.org/lieux-de-pratique/).
- Five historic temples with no preferred link now have direct temple or
  institutional sources: [Kōshō-ji](https://www.uji-koushouji.jp/),
  [Yōkō-ji](https://www.sotozen-net.jp/temple/68),
  [Hōkyō-ji](https://www.city.ono.fukui.jp/kanko/kanko-joho/guide/houkyoji.html),
  [Zuishō-ji](https://www.gotokyo.org/en/spot/1090/index.html), and
  [Chilbulsa](https://chilbul.or.kr/doc/0102.php). Chilbulsa's precise
  first-century founding date was removed because its temple page presents
  the origin as a traditional account.
- Sōtōshū's [Aichi Senmon Nisōdō page](https://www.sotozen.com/ita/temples/jp/shoboji.html),
  [Sho Den's practice page](https://www.zenchile.cl/projects-6), and
  [Kannon Polska's Kąciki page](https://www.kannon.pl/centrum-zen-kaciki/)
  replaced stale links. The last two supplied visitor details and a corrected
  approximate Kąciki pin. [Kwan Um Hungary](https://www.kvanumzen.hu/en/community-sangha)
  and [Rocky Mountain Ecodharma](https://rmerc.org/) also now have current
  preferred links; conflicting RMERC street addresses remain unconfirmed.
- [Great Wave Zen Sangha](https://greatwave.org/locations/) identifies its
  Ludington temple at 315 N. Rath, so its incorrect Ann Arbor pin and city
  were corrected. Its [lineage page](https://greatwave.org/the-lineage-of-teachers/)
  names White Plum membership. [White Plum's Empty Bowl profile](https://whiteplum.org/membership-list-mobile/user/460/)
  supports that zendo's Morristown address; its pin was corrected to the
  named venue.
- [Doshin Dojo de Charleroi](https://www.zen-azi.org/index.php/fr/node/3053)
  now points to its individual AZI listing, which confirms the rue de Montigny
  address and current contact instead of relying on the obsolete AZB directory.
- Three Chinese historical temples with no preferred link now point to
  institutionally maintained pages: [Sizu Temple](https://www.hmszs.org/110/2013/03/20130327288.html),
  [Baizhang Temple](https://www.jxrd.gov.cn/system/2012/11/23/012188560.shtml),
  and [Caoshan Baoji Temple](https://www.jxsfjxh.cn/a/1602486239564070914).
  The Sizu and Baizhang founding years were removed because these pages did
  not support their precise dates. Baizhang's page is historical, so current
  visiting arrangements remain unconfirmed.

Bounded research batches examined 40 alphabetical Plum Village lay-group
candidates and 24 apparently missing preferred links. Individual names on
institutional lists or working group sites were useful evidence of identity;
they did not establish current meetings or safeguarding for all 64 records.
Automated link failures were not treated as proof that a group closed.

The newer [Leven in Aandacht page for Wake Up Leuven](https://aandacht.net/meditatiegroepen/sangha-vinden2/item/wake-up-leuven-2)
describes a group, while an older [Wake Up International profile](https://wkup.org/sangha-of-the-month/wake-up-leuven/)
labels its earlier sangha inactive. The listing points to the newer page, but
continuity and current meeting details remain unconfirmed. A separate
12-record White Plum sample found [Zen Sangha](https://whiteplum.org/membership-list-public/)
and [Zendo Mãos Vazias](https://whiteplum.org/membership-map/) on White Plum's
member pages; those pages do not verify the Belgian local subgroups or their
meeting addresses. Their review flags remain in place.

Another bounded pass examined 13 missing preferred links, ten broken-link
candidates outside Belgium and France, and 12 White Plum-sourced records. It
did not conflate the older Caracas Sōtō Zen listing with a different current
Caracas group, or infer closure from an inaccessible page. Historical directory
mentions for Antigua, Montevideo, and several small groups still need current
group or network confirmation. The White Plum sample found more direct member
and own-site evidence; entries without a published meeting place or clear
affiliation remain in the review queue.

A third 12-record White Plum batch replaced six broad citations with current
group pages. [Green Mountain Zen](https://greenmountainzen.org.nz/the-teacher/),
[Green River Zen](https://www.greenriverzen.org/),
[Grey Heron Zen](https://greyheronzen.ie/zen-meditation-sittings-dublin/),
[Heart Circle Zen](https://heartcirclezen.org/events-2),
[Hokori Zen Center](https://www.hokorizencenter.org/schedule), and
[Joyful Mind](https://www.joyfulmindzendo.org/) now have directly sourced
locations or schedules. This corrected Heart Circle from Ridgewood to
Hackensack, Hokori from Boca Raton to Lakeland, Green River from Greenfield to
South Deerfield, and Joyful Mind from Delaware to Rockville, Maryland. The
remaining six records lacked enough current, item-level evidence and remain
queued without an adverse finding.

A fourth batch consolidated the duplicate “Plum Village Australia” record
into [Stream Entering Monastery](https://plumvillage.org/practice-centre/stream-entering-monastery),
using Plum Village's current Porcupine Ridge address. It also replaced broad
citations for eight Plum Village tradition groups in Brazil and Canada with
their own or their network's item-level pages. Current group sites corrected
Maple Village's preferred link and the Montréal and Vancouver links.

Direct group and network pages replaced generic citations for five Australian
Zen groups, Nan Tien and Chung Tian temples, six Hong Kong and German groups,
and five United States sanghas. Current venues moved Palmetto Zendo from Tampa
to Fort Myers, One Heart Sangha from Silver Spring to Washington, Day Star
from Worcester to Wrentham, and Full Moon Zen from Boston to Cambridge. One
River Zen's own site also supplied its Ottawa venue and Sōtō lineage. The
Aarhus Zendo active listing was removed because Øsal Ling's current site says
that Sōtō Zen Aarhus has closed. None of these listing changes is a conduct
finding.

The latest bounded batch reviewed Australian groups, White Plum groups, and
Plum Village records. Direct group or institutional pages now support Canberra
Soto Zen, Darwin Zen, Forest Way Zen, Kuan Yin Meditation Centre, Mountains &
Rivers Zen, three Open Way groups, Morning Star Zendo, No Gate Zen, Order of
Clear Mind Zen, Staten Island Zen, Empty Hand Zen, Pamsula, and Dragon's Eye
Zendo. Pamsula's listing moved from New York to its current Iowa City location.
Current Plum Village sources now support five monastic centres, Bogotá and
Czech Plumline entries, Interbeing Denmark, and four French sangha records.
Bonzazen was corrected from a Plum Village description to its stated Sōtō
lineage. Records whose identity, current activity, or affiliation could not be
confirmed remain queued without an adverse finding.

The following batch checked every URL then returning 404 or 410 and sampled
the next Plum Village and White Plum records. Current institutional pages
replaced stale links for Turnhout, Mulhouse, Indozan Sogenji, Aichi Senmon
Nisōdō, and the Montevideo Kōsen dojo. Ambiguous possible successors in Mons,
Vilvoorde, Foix, Sittard, and elsewhere were not merged. Zen Sangha Belgium's
current local pages supplied updated venues for Antwerp, Brussels, Bruges,
Mol, Jodoigne, and Ghent; its redundant umbrella map point was removed.
BuddhaWeg Solingen was corrected from White Plum to the Sōtō/Deshimaru line
described by the German Buddhist Union. Current Wake Up, Intersein, Irish,
Danish, and French network pages replaced another set of broad citations.
The review queue fell by 42 records while uncertain current activity remained
explicitly unresolved.

The next batch checked popular-only Australian and Austrian records and the
next Plum Village and White Plum cohorts. Current group pages supplied venues,
schedules, lineage descriptions, or 2026 activity for Ermita de Paja, five
Australian groups, BergZendo, Stille in Wien, Izen Utrecht, Zen Tree, Zen
Alkmaar, Kanzeon Warsaw, Svalornas, Wholehearted Zen, and several French
sanghas. Born As The Earth was corrected to its stated Sōtō lineage because
its direct site did not support the prior White Plum classification. The
Coimbra Wild Flower entry now describes the current association's online and
retreat program without claiming a standing weekly Coimbra group. A suspected
Pasargada/A Outra Margem conflation and unsupported local Kanzeon branches
remain queued. This reduced the priority queue by another 32 records.

The source seed is now deterministic: maintained practice-directory metadata
overrides generic historical stubs. Before this fix, running the teaching seed
after the temple seed silently changed source reliability and made the review
queue vary by seed order.

The latest batch replaced broad or generic directory references with current
group pages for practice communities in Austria, Belgium, Brazil, Canada,
France, and the United States. It corrected Zen Gruppe Linz's network,
Atlantic Sōtō Zen Centre's affiliation, Citrus Zen's city and identity, and
current venues for Shikantaza Mons, Zendo Curitiba, Via Zen, Bread Loaf,
Great Mountain, Great Plains, Morgan Bay, Lost Coin, and New River Zen.
Clifton Hill Zendo was removed after Melbourne Zen Group's history documented
its closure and later move. Eighthwave and New England Council Collective were
removed because their current public work does not establish a standing Zen
practice place. Two French sanghas explicitly marked paused were removed from
the active map. These scope and status decisions are not conduct findings.

A further cohort replaced generic citations for Canadian Zen groups, French
Plum Village communities, and White Plum related practices with current group
pages, schedules, member profiles, and exact venues. The review corrected the
Montreal Zen Center venue, several Canadian schedules, and current locations
for Prairie Zen, San Luis Obispo Zen Circle, Sweetwater, Still Mind, and the
New York Zen Center for Contemplative Care. Rocky Mountain Ecodharma is now
described as a multi-tradition retreat venue because no item-level White Plum
affiliation was found. The duplicate Centro Zen Chile and unsupported
Bydgoszcz Kanzeon satellite were consolidated into their current canonical
organizations. Centre Tchenrezik and the obsolete Sittard listing were removed
after their old links disappeared and no current practice-place evidence was
found. Missing evidence remains an uncertainty, not a conduct finding.

Batch 13 checked current item-level evidence for 15 Plum Village groups, 15 White Plum-derived rows, and 15 widely known Chinese temples. Direct group pages now support the Eindhoven, Wageningen, Westfriesland, Hulsberg, Seven Sisters, Still Waters, Sollandet, Tacoma, Westhampton, Tucson, Nevada City, and Oak Park records. Two entries were removed because their own current descriptions did not support the mapped Zen-center identity or geography. Three obsolete Belgian listings and the unsupported Angoulême group were removed after they disappeared from the relevant current official directories. Donglin and Guoqing were removed as Pure Land and Tiantai institutions outside this directory’s Zen scope. The Chinese temple descriptions now distinguish active temples and historical Chan affiliation from an unverified public meditation schedule.

Batch 14 replaced generic network citations with current local evidence for practice groups in the United Kingdom, Ireland, Sweden, the Netherlands, Brazil, Switzerland, the United States, Venezuela, and Vietnam. The review removed fifteen mapped records whose old organization name, geography, or current operation could not be substantiated, while adding the currently documented Sangha Dōkan and Centro Zen Buppo communities in Venezuela. No record now lacks a preferred URL. The citation audit also stopped treating a teacher’s White Plum membership as proof that the teacher’s organization is institutionally affiliated. Current direct sources reduced the broad-source queue from 197 to 124 records.

Batch 15 reviewed the remaining broad-citation cohorts alongside historic Chan temples in China and two Colombian records. Direct group, monastery, government, and Buddhist-association sources replaced generic citations for Plum Village and White Plum related communities and for Nanhua, Tiantong, Xuedou, Zhenru, Daishinji, and other Chinese heritage temples. Generic Vietnamese Thiền records are no longer classified as Plum Village unless their evidence names that tradition. Putuoshan Puji was removed as a Guanyin pilgrimage temple outside the directory's Zen scope; the former Fundación Zen “Templo Gen To” venue was removed because the organization says activity there ended in 2018. Six additional groups were removed where their own current description documented closure or where current evidence did not support presenting an active public practice place. Two Italian national networks were also removed because city pins would misrepresent them as local venues; the Israeli umbrella record is explicitly described as a national network. The broad-source queue fell from 124 to 50, and every removal remains a scope or current-evidence decision rather than a conduct finding.

Batch 16 checked 44 records in the Americas, Europe, Australia, and New Zealand. Current direct pages supplied corrected venues or schedules for Buenos Aires, Medellín, Mexico City, Peruvian Sōtō temples, Vienna, Linz, Berlin, the Croatian Dharmaloka center, Nordic and Hungarian groups, and New Zealand practice communities. The duplicate Budapest Zen Dojo/Taisenji records were consolidated, the Mokusho network pin now identifies its specific Taisenji temple, and national or multi-site descriptions no longer imply unsupported local schedules. Several small groups remain listed with explicit stale-schedule or unverified-venue caveats because older lineage evidence alone cannot establish current public meetings. Mar de Jade is now described as a retreat host rather than as a local lineage organization. These source upgrades reduced the priority queue from 491 to 453 records without treating missing evidence as a conduct finding.

Batch 17 reviewed Canadian centers, historic Chinese and Hong Kong temples, and two French AZI listings. Current institutional pages corrected Canadian schedules and affiliation wording, replaced several Wikipedia or generic directory citations for Chan heritage temples, and distinguished broader Humanistic Buddhist centers from exclusively Zen organizations. Kingston’s historical satellite was removed because no current item-level evidence was found. Caotang was removed as a Sanlun and translation-history institution outside the Chan directory; Chi Lin was removed after its own history identified Pure Land origins and practice; and the Hong Kong Pu Men record was removed because it conflated a local general Buddhist temple with Fo Guang Shan. The Issy and Bergerac records now use their current AZI identities and addresses. These are scope and current-evidence corrections, not conduct findings, and they reduced the priority queue from 453 to 437.

Batch 18 reviewed European groups, an Americas cohort, and 15 Japanese temples. Current first-party pages supplied schedules, corrected venues, and narrower lineage wording for Czech, Danish, German, United States, and Japanese records. Pasárgada, Dharma Sangha México, and Bodhidharma Zen-Gemeinschaft were removed from the current-practice map because only historical or directory evidence could be found; this does not establish closure. The Annapolis group remains queued with its current activity and affiliations explicitly unverified. Sōtō Zen Aarhus and Daishin Zen Berlin were removed after current organizational pages documented closure or only a future relaunch. Linh Sơn A Di Đà Viện was removed from the Zen-specific map after its official site documented a Texas Pure Land practice center rather than the mapped Ohio Zen venue. Jufuku-ji was removed from the public-practice map because current visitor information limits access and no public practice program was found. Heilbronn was renamed to its current organization identity without treating the rename as a closure. The priority queue fell from 437 to 395 and broad citations from 50 to 47.

## Next review work

Start with the 2 records whose preferred URL returned 404/410. Then review the 346 `popular`-only citations and 47
broad-page citations against direct group or institutional pages. For each correction, update
the canonical seed or raw place data, cite the direct source, and rerun the
seed and audit. Do not infer misconduct from missing websites or policies.

To reproduce the URL and priority reports locally:

```bash
python3 scripts/check-practice-links.py --output /tmp/practice-links.csv
python3 scripts/audit-practice-directory.py --links /tmp/practice-links.csv > /tmp/practice-review.csv
```
