# Accuracy Audit Report

Field-level correctness gaps — uncited facts, missing uncertainty markers, unattributed teachings. Produced by `scripts/audit-accuracy.ts`. Regenerate with `npm run audit:accuracy`.

## Summary

| severity | count | tier-1 count |
|---|---:|---:|
| CRITICAL | 0 | 0 |
| WARNING | 73 | 29 |
| INFO | 223 | — |
| **total** | **296** | — |

**No CRITICAL issues.** Tier-1 masters have citations for the claims that are hardest to correct after-the-fact.

## Issues by category

### native-script-missing (251)

| severity | tier | entity | field | detail |
|---|---|---|---|---|
| WARNING | tier1 | `master/ananda` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/aryadeva` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/ashvaghosha` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/buddhamitra` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/buddhanandi` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/dhritaka` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/gayashata` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/haklena` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/jayata` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/kapimala` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/kumarata` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/mahakashyapa` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/manorhita` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/michaka` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/nagarjuna` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/parshva` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/prajnatara` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/punyamitra` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/punyayashas` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/rahulata` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/sanghanandi` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/shakyamuni-buddha` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/shanakavasa` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/simha` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/upagupta` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/vasasita` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/vasubandhu` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/vasumitra` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/yunyan-tansheng` | names:cjk | School=qingyuan-line expects a name in [cjk] but no name contains characters in those ranges. |
| INFO | other | `master/baiyun-shouduan` | names:cjk | School=yangqi-line expects a name in [cjk] but no name contains characters in those ranges. |

_…and 221 more. See `accuracy-report.csv` for the complete list._

### source-popular (1)

| severity | tier | entity | field | detail |
|---|---|---|---|---|
| INFO | — | `source/Wikipedia - Zen Lineage Charts` | — | Source reliability='popular'. Consider replacing with a scholarly source or downgrading claims that depend on it. |

### teaching-unattributed (44)

| severity | tier | entity | field | detail |
|---|---|---|---|---|
| WARNING | — | `teaching/proverb-all-know-the-way` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-arrow-left-bow` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-bamboo-forest-dense` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-bamboo-shadows` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-before-bell-rings` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-blue-mountains` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-cast-off-realized` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-clear-water-bottom` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-clouds-come-and-go` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-drink-tea-slowly` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-drinks-water-knows` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-entering-the-forest` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-fall-seven-times` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-frog-in-well` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-great-path-no-gate` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-hundred-foot-pole` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-inch-of-time` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-iron-tree-blooms` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-knock-on-sky` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-landscape-of-spring` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-lotus-muddy-water` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-moon-not-think-reflected` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-moon-river-wind-pines` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-move-way-will-open` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-not-twice-this-day` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-plunge-into-poison` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-put-heart-at-rest` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-return-to-root` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-reverse-side` | — | No author_id and no teaching_master_roles row. Who said this? |
| WARNING | — | `teaching/proverb-ride-horse-sword-edge` | — | No author_id and no teaching_master_roles row. Who said this? |

_…and 14 more. See `accuracy-report.csv` for the complete list._
