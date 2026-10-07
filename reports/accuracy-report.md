# Accuracy Audit Report

Field-level correctness gaps — uncited facts, missing uncertainty markers, unattributed teachings. Produced by `scripts/audit-accuracy.ts`. Regenerate with `npm run audit:accuracy`.

## Summary

| severity | count | tier-1 count |
|---|---:|---:|
| CRITICAL | 0 | 0 |
| WARNING | 205 | 85 |
| INFO | 139 | — |
| **total** | **344** | — |

**No CRITICAL issues.** Tier-1 masters have citations for the claims that are hardest to correct after-the-fact.

## Issues by category

### license-unset (53)

| severity | tier | entity | field | detail |
|---|---|---|---|---|
| WARNING | — | `teaching_content/anderson-being-upright:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/anderson-third-turning:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/anderson-warm-smiles-cold-mountains:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/azi-zen-azi-org:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/coupey-dojo-zen-paris:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/coupey-sit:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/deshimaru-la-pratique-du-zen:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/deshimaru-mushotoku-mind:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/deshimaru-questions-to-zen-master:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/deshimaru-zen-way-to-martial-arts:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/enomiya-living-in-the-new-consciousness:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/enomiya-zen-meditation-for-christians:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/enomiya-zen-und-christliche-mystik:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/enomiya-zen-way-to-enlightenment:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/forstman-in-the-cloud-podcast:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/forstman-mountain-cloud-youtube:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/habito-be-still-and-know:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/habito-experiencing-buddhism:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/habito-healing-breath:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/habito-living-zen-loving-god:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/habito-maria-kannon-youtube:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/habito-total-liberation:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/habito-zen-spiritual-exercises:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/jager-benediktushof:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/jager-contemplation-christian-path:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/jager-mysticism-modern-times:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/jager-search-for-meaning:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/jager-way-to-contemplation:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/jager-west-oestliche-weisheit:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |
| WARNING | — | `teaching_content/jager-westoestliche-weisheit:en` | license_status | license_status is 'unknown'. Every translation must declare its license. |

_…and 23 more. See `accuracy-report.csv` for the complete list._

### native-script-missing (218)

| severity | tier | entity | field | detail |
|---|---|---|---|---|
| WARNING | tier1 | `master/alfonso-sengen-fernandez` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/alonso-taikai-ufano` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/ananda` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/andre-ryujo-meissner` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/antoine-charlot` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/antonio-taishin-arana` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/ariadna-dosei-labbate` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/aryadeva` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/ashvaghosha` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/barbara-kosen-richaudeau` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/begona-kaido-agiriano` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/beppe-mokuza-signoritti` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/buddhamitra` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/buddhanandi` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/christophe-ryurin-desmur` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/claude-emon-cannizzo` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/claus-heiki-bockbreder` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/dhritaka` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/dosho-saikawa` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/emanuela-dosan-losi` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/etienne-mokusho-zeisler` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/eveline-kogen-pascual` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/evelyne-eko-de-smedt` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/francoise-jomon-julien` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/gayashata` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/haklena` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/heinz-juergen-metzger` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/hugues-yusen-naas` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/huguette-moku-myo-sirejol` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/ingrid-gyuji-igelnick` | names:cjk | School=soto expects a name in [cjk] but no name contains characters in those ranges. |

_…and 188 more. See `accuracy-report.csv` for the complete list._

### source-popular (6)

| severity | tier | entity | field | detail |
|---|---|---|---|---|
| INFO | — | `source/budismo.com — Directorio de Centros y Templos Budistas` | — | Source reliability='popular'. Consider replacing with a scholarly source or downgrading claims that depend on it. |
| INFO | — | `source/Wikipedia - Zen Lineage Charts` | — | Source reliability='popular'. Consider replacing with a scholarly source or downgrading claims that depend on it. |
| INFO | — | `source/Wikipedia — Gotō Zuigan` | — | Source reliability='popular'. Consider replacing with a scholarly source or downgrading claims that depend on it. |
| INFO | — | `source/Wikipedia — Oda Sessō` | — | Source reliability='popular'. Consider replacing with a scholarly source or downgrading claims that depend on it. |
| INFO | — | `source/Wikipedia — Sōkō Morinaga` | — | Source reliability='popular'. Consider replacing with a scholarly source or downgrading claims that depend on it. |
| INFO | — | `source/Wikipedia — Tetsuo Sōkatsu` | — | Source reliability='popular'. Consider replacing with a scholarly source or downgrading claims that depend on it. |

### teaching-unattributed (66)

| severity | tier | entity | field | detail |
|---|---|---|---|---|
| WARNING | — | `teaching/diamond-sutra-deharlez-1892` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/diamond-sutra-gemmell-1912` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/diamond-sutra-kumarajiva` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/diamond-sutra-mueller-1894` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/diamond-sutra-sanskrit` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/diamond-sutra-walleser-1914` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/heart-sutra-beal-1871` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/heart-sutra-feer-1866` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/heart-sutra-japanese-chant` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/heart-sutra-mueller-1894` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/heart-sutra-sanskrit` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/heart-sutra-walleser-1914` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/heart-sutra-xuanzang` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/lotus-sutra-burnouf-1852` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/lotus-sutra-japanese-chant` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/lotus-sutra-kern-1884` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/lotus-sutra-kumarajiva` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/lotus-sutra-sanskrit` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/platform-sutra-goddard-1932` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/platform-sutra-wong-1930` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/platform-sutra-zongbao` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-all-know-the-way` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-arrow-left-bow` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-bamboo-forest-dense` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-bamboo-shadows` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-before-bell-rings` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-blue-mountains` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-cast-off-realized` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-chop-wood-carry-water` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-clear-water-bottom` | — | No author_id and no teaching_master_roles row. Who said this? |

_…and 36 more. See `accuracy-report.csv` for the complete list._

### transmission-uncited (1)

| severity | tier | entity | field | detail |
|---|---|---|---|---|
| WARNING | other | `master_transmission/tokuzui-tenrin <- gesshu-soko` | — | Transmission type=primary has no citation at entity or related field level. |
