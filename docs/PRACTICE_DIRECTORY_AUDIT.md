# Practice directory audit — 8 October 2026

This is a **triage pass**, not a claim that every place has been personally
verified. It combines a fresh seed of the canonical place records with a
read-only HTTP check of the preferred URLs on 7 October, plus checks of new
preferred URLs on 8 October. HTTP results do not
establish a group's current activity, lineage, or safeguarding.

## Coverage

| Check | Result |
|---|---:|
| Place records | 1,696 |
| Distinct preferred URLs checked | 1,346 |
| URLs returning 2xx/3xx | 1,105 |
| URLs returning 404/410 | 13 (used by 16 records) |
| URLs blocked or rate limited | 20 (used by 22 records) |
| URLs with inconclusive network/server results | 208 (used by 216 records) |
| Records with no preferred URL | 10 |
| Records with only a `popular`-class citation | 526 |
| Records needing an item-level check because their sole citation is broad | 357 |
| Records queued to check first (overlapping signals combined) | 896 |
| City-level, approximate map pins | 870 |

Every remaining place has exactly one citation, currently attached to `coordinates`.
That citation alone cannot establish affiliation, an active schedule, or a
safeguarding process. The seed labels all 1,696 places `active`, but it has no
per-place last-checked date. The public map and exported JSON no longer expose
that seed status as a verified claim.

The 357 broad-page citations comprise 259 rows citing Plum Village's
[monastic centres page](https://plumvillage.org/community/monastic-practice-centres)
and 98 citing the [White Plum founder page](https://whiteplum.org/founder/).
Those pages do not individually support all the lay groups assigned to them.
The review queue now flags each for a direct group or institutional listing.
This is a limitation of our citations, not a claim that any group has doubtful
origins.

The 404/410 set needs human confirmation before changing or removing entries.
For example, the automated client received a 404 from the
[Sōtōshū Shōbōji page](https://www.sotozen.com/eng/temples/jp/shoboji.html),
which remains accessible in a browser and in search. Some other sites may behave
similarly. A failed URL is evidence about this check, not about the group.
The automated client also received a 404 from AZI's
[Mulhouse group page](https://www.zen-azi.org/fr/node/436), which opened in
a browser. The separate domain linked from that AZI page currently presents
unrelated wellness articles; the directory therefore uses the AZI listing.
The automated client likewise returned a 404 from Sōtōshū's
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

## Next review work

Start with the 16 records whose preferred URL returned 404/410 and the 10
without a preferred URL. Then review the 526 `popular`-only citations and 357
broad-page citations against direct group or institutional pages. For each correction, update
the canonical seed or raw place data, cite the direct source, and rerun the
seed and audit. Do not infer misconduct from missing websites or policies.

To reproduce the URL and priority reports locally:

```bash
python3 scripts/check-practice-links.py --output /tmp/practice-links.csv
python3 scripts/audit-practice-directory.py --links /tmp/practice-links.csv > /tmp/practice-review.csv
```
